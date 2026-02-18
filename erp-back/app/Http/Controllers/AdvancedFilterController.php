<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdvancedFilterController extends Controller
{
    protected $groupByContext = null;
    protected $tableName = null;
protected $hasGroupby     = false;

    public function advancedFilter(Request $request)
    {
        if ($request->tableName === 'users' && $request->auth !== 'auth') {
            return response()->json(['error' => 'not found'], 404);
        }

        $this->tableName = $request->tableName;
        $validated = $request->all();

        // Aggregate query (may include groupby)
        $query = DB::table($this->tableName);




        $this->applyFilters($query, $validated, false);
        $this->applySorting($query, $validated);

        // If a JSON groupby was requested, run the aggregate + detail pairing flow
        if ($this->hasGroupby && $this->groupByContext) {
            return $this->returnGroupedWithItems($query, $validated);
        }

        // Otherwise, regular pagination
        return $this->paginateResults($query, $validated);
    }



protected function sumItemNumber(array $validated, string $jsonField, int $maxItems = 199): float
{
    $base = DB::table($this->tableName)->whereNull('deleted_at');
    $this->applyFilters($base, $validated, true);
    $baseSql      = $base->toSql();
    $baseBindings = $base->getBindings();

    $sql = "
        WITH RECURSIVE seq AS (
            SELECT 0 AS idx
            UNION ALL
            SELECT idx + 1 FROM seq WHERE idx < {$maxItems}
        )
        SELECT SUM(
            CAST(
                JSON_UNQUOTE(
                    JSON_EXTRACT(b.main, CONCAT('$.items[', seq.idx, '].{$jsonField}'))
                ) AS DECIMAL(18,2)
            )
        ) AS total_val
        FROM ({$baseSql}) AS b
        JOIN seq ON seq.idx < JSON_LENGTH(b.main, '$.items')
    ";

    $row = DB::selectOne($sql, $baseBindings);
    return (float) ($row->total_val ?? 0);
}

protected function sumProfit(array $validated, int $maxItems = 199): float
{
    // Base (filtered) subquery; skip any groupby
    $base = DB::table($this->tableName)->whereNull('deleted_at');
    $this->applyFilters($base, $validated, true);
    $baseSql      = $base->toSql();
    $baseBindings = $base->getBindings();

    $sql = "
        WITH RECURSIVE seq AS (
            SELECT 0 AS idx
            UNION ALL
            SELECT idx + 1 FROM seq WHERE idx < {$maxItems}
        )
        SELECT SUM(
            COALESCE(
                CAST(JSON_UNQUOTE(JSON_EXTRACT(b.main, CONCAT('$.items[', seq.idx, '].total')))      AS DECIMAL(18,2)),
                0
            ) -
            COALESCE(
                CAST(JSON_UNQUOTE(JSON_EXTRACT(b.main, CONCAT('$.items[', seq.idx, '].unitPrice2'))) AS DECIMAL(18,2)),
                0
            )
        ) AS total_profit
        FROM ({$baseSql}) AS b
        JOIN seq ON seq.idx < JSON_LENGTH(b.main, '$.items')
    ";

    $row = DB::selectOne($sql, $baseBindings);
    return (float) ($row->total_profit ?? 0);
}

    protected function paginateResults($query, $validated)
    {
        $perPage = $validated['per_page'] ?? 15;
        return $query->whereNull('deleted_at')->paginate($perPage)->appends($validated);
    }

    protected function returnGroupedWithItems($aggregateQuery, $validated)
    {
        // 1) Run the aggregate query (already has groupBy/selects from the groupby filter)
        $aggregates = (clone $aggregateQuery)->whereNull('deleted_at')->get();

        // 2) Detail rows: apply the same filters but SKIP the groupby operator
        $details = DB::table($this->tableName);
        $this->applyFilters($details, $validated, true); // skip groupby
        // If you want sorting on details, uncomment:
        // $this->applySorting($details, $validated);

        // Decide grouping expression/alias for details
    if (isset($this->groupByContext['expr'])) {
        $exprSql = $this->groupByContext['expr'];
        $alias   = $this->groupByContext['alias'] ?? 'group_key';
    } elseif (isset($this->groupByContext['field'])) {
        $field    = $this->groupByContext['field'];
        $jsonPath = $this->groupByContext['jsonPath'];
        $exprSql  = "JSON_UNQUOTE(JSON_EXTRACT($field, '$jsonPath'))";
        $alias    = 'customer_name';
    } else {
        $exprSql = '1';
        $alias   = 'group_key';
    }


    $details->addSelect('*');
    $details->addSelect(DB::raw("$exprSql as {$alias}"));
    $details->whereNull('deleted_at');
    $detailRows = $details->get();


            $rowsByKey = $detailRows->groupBy($alias);
    $aggregates->transform(function ($row) use ($rowsByKey, $alias) {
        $row->items = $rowsByKey->get($row->{$alias}, collect())->values();
        return $row;
    });



        // Counts for the same filtered set, skipping groupby
        $countsQuery = DB::table($this->tableName);
        $this->applyFilters($countsQuery, $validated, true); // skip groupby
        $counts = $countsQuery
            ->whereNull('deleted_at')
            ->selectRaw("SUM(CASE WHEN status = 'Paid'          THEN 1 ELSE 0 END) AS paid_count")
            ->selectRaw("SUM(CASE WHEN status = 'Unpaid'        THEN 1 ELSE 0 END) AS unpaid_count")
            ->selectRaw("SUM(CASE WHEN status = 'PartiallyPaid' THEN 1 ELSE 0 END) AS partially_paid_count")
            ->first();

        return response()->json([
            'data'   => $aggregates,
            'counts' => $counts,
            'totals' => [
    'unitPrice'  => $this->sumItemNumber($validated, 'unitPrice'),
    'unitPrice2' => $this->sumItemNumber($validated, 'unitPrice2'),
        'profit'     => $this->sumProfit($validated),

],

        ]);
   //     return response()->json($aggregates);
    }

    protected function applyFilters($query, $validated, $skipGroupby = false)
    {
        if (empty($validated['filters'])) {
            return;
        }
        foreach ($validated['filters'] as $filter) {
            $this->applySingleFilter($query, $filter, $skipGroupby);
        }
    }

    public function applySorting($query, array $validated)
    {
        if (empty($validated['sorts'])) {
            return;
        }


    // If a groupby is active, only allow sorting on the group alias
    if ($this->groupByContext) {
        $alias = $this->groupByContext['alias'] ?? null;
        if (!$alias) {
            return; // no alias to sort on; skip sorting
        }
        foreach ($validated['sorts'] as $sort) {
            $field     = $sort['field'];
            $direction = $sort['direction'] ?? 'asc';
            // Only apply sort if it targets the grouping alias
            if ($field === $alias) {
                $query->orderBy(DB::raw($alias), $direction);
            }
        }
        return; // prevent other sorts (e.g., id) from being applied
    }


        foreach ($validated['sorts'] as $sort) {
            $this->applySingleSort($query, $sort);
        }
    }

    protected function applySingleSort($query, array $sort)
    {
        $field = $sort['field'];
        $direction = $sort['direction'] ?? 'asc';
        $type = $sort['type'] ?? 'basic';

        if ($type === 'json') {
            $this->applyJsonSort($query, $sort);
        } else {
            $query->orderBy($field, $direction);
        }
    }

    protected function applyJsonSort($query, array $sort)
    {
        $field = $sort['field'];
        $direction = $sort['direction'] ?? 'asc';
        $jsonPath = $sort['json_path'] ?? '$';

        $jsonField = DB::raw("JSON_UNQUOTE(JSON_EXTRACT($field, '$jsonPath'))");
        $query->orderBy($jsonField, $direction);
    }

    protected function applySingleFilter($query, array $filter, $skipGroupby = false)
    {
        $field = $filter['field'];
        $operator = $filter['operator'] ?? '=';
        $value = $filter['value'];
        $type = $filter['type'] ?? 'basic';
        $andOr = $filter['andOr'] ?? 'and';

        if ($type === 'json') {
            $this->applyJsonFilter($query, $filter, $andOr, $skipGroupby);
        } else {
            $this->applyBasicFilter($query, $field, $operator, $value, $andOr, $skipGroupby);
        }
    }

    protected function applyBasicFilter($query, $field, $operator, $value, $andOr, $skipGroupby = false)
    {
        // Support basic groupby on non-JSON fields
        // if (strtolower($operator) === 'groupby') {
        //     if ($skipGroupby) {
        //         return;
        //     }
        //     $fields = is_array($field) ? $field : explode(',', $field);
        //     $query->groupBy(array_map('trim', $fields));
        //     return;
        // }

        $validOperators = ['=', '!=', '>', '<', '>=', '<=', 'like', 'not like', 'in', 'not in'];

        if (! in_array($operator, $validOperators)) {
            throw new \InvalidArgumentException("Invalid operator: {$operator}");
        }

        if (in_array($operator, ['in', 'not in'])) {
            $value = is_array($value) ? $value : explode(',', $value);
            $method = $andOr === 'or' ? 'orWhereIn' : 'whereIn';

            if ($operator === 'not in') {
                $method = $andOr === 'or' ? 'orWhereNotIn' : 'whereNotIn';
            }

            $query->{$method}($field, $this->formatValue($operator, $value));
        } else {
            $method = $andOr === 'or' ? 'orWhere' : 'where';
            $query->{$method}($field, $operator, $this->formatValue($operator, $value));
        }
    }

    protected function formatValue($operator, $value)
    {
        if ($operator === 'like' || $operator === 'not like') {
            return '%' . $value . '%';
        }
        return $value;
    }

    protected function applyJsonFilter($query, array $filter, $andOr, $skipGroupby = false)
    {
        $field = $filter['field'];
        $operator = $filter['operator'] ?? '=';
        $value = $filter['value'] ?? null;
        $jsonPath = $filter['json_path'] ?? '$';


// Match warehouseName inside main.warehouses array; optional stock > 0
if ($operator === 'warehouse_name') {
    $warehouseName = $value;
    $requireStock  = (bool) ($filter['require_stock'] ?? false);

    if ($warehouseName === null || $warehouseName === '') {
        return; // nothing to filter
    }

    // Simple name match
    $nameMatchExpr = "JSON_SEARCH($field, 'one', ?, NULL, '$.warehouses[*].warehouseName')";

    if (! $requireStock) {
        // Just check that the warehouse name exists
        $query->whereRaw("$nameMatchExpr IS NOT NULL", [$warehouseName]);
        return;
    }

    // Name must exist AND quantity > 0 for that warehouse (MariaDB-safe; no JSON_TABLE)
    $query->whereRaw("
        EXISTS (
            WITH RECURSIVE seq AS (
                SELECT 0 AS idx
                UNION ALL
                SELECT idx + 1 FROM seq WHERE idx < 199
            )
            SELECT 1
            FROM seq
            WHERE seq.idx < JSON_LENGTH($field, '$.warehouses')
              AND JSON_UNQUOTE(JSON_EXTRACT($field, CONCAT('$.warehouses[', seq.idx, '].warehouseName'))) = ?
              AND CAST(JSON_UNQUOTE(JSON_EXTRACT($field, CONCAT('$.warehouses[', seq.idx, '].quantity'))) AS DECIMAL(18,2)) > 0
            LIMIT 1
        )
    ", [$warehouseName]);

    return;
}


        // Inside applyJsonFilter
if ($operator === 'in_json_ids') {
    $ids = collect($value ?? [])
        ->map(fn ($row) => $row['id'] ?? null)
        ->filter()
        ->map(fn ($id) => (int) $id)
        ->values()
        ->all();

    if (empty($ids)) {
        // No IDs to filter; optionally return or force empty result
        return;
    }

    // Compare the JSON id as unsigned int
    $jsonIdExpr = "CAST(JSON_UNQUOTE(JSON_EXTRACT($field, '$jsonPath')) AS UNSIGNED)";
    $query->whereIn(DB::raw($jsonIdExpr), $ids);
    return;
}


            // JSON date-based grouping
    if ($operator === 'groupby_date') {
        if ($skipGroupby) {
            return;
        }
        $this->hasGroupby = true;

        // Extract and cast to DATE (assumes ISO date/datetime string in JSON)
        $dateExpr = "DATE(JSON_UNQUOTE(JSON_EXTRACT($field, '$jsonPath')))";

        $period = strtolower($value ?? 'week'); // value drives the period
        switch ($period) {
            case 'month':
                $exprSql    = "DATE_FORMAT($dateExpr, '%Y-%m')";
                $alias      = 'month_key';
                $labelExpr  = "DATE_FORMAT($dateExpr, '%Y-%m-01')";
                break;
            case 'year':
                $exprSql    = "YEAR($dateExpr)";
                $alias      = 'year_key';
                $labelExpr  = "CONCAT(YEAR($dateExpr), '-01-01')";
                break;
            default: // week
                $exprSql    = "YEARWEEK($dateExpr, 1)"; // ISO week
                $alias      = 'week_key';
                $labelExpr  = "STR_TO_DATE(CONCAT(YEARWEEK($dateExpr,1), ' Monday'), '%X%V %W')";
                break;
        }


        
        // Store context for detail query
        $this->groupByContext = [
            'expr'      => $exprSql,
            'alias'     => $alias,
            'labelExpr' => $labelExpr,
            'json_date' => true,
        ];

        $query->addSelect(DB::raw("$exprSql as {$alias}"));
        $query->addSelect(DB::raw("$labelExpr as customer_name"));
        $query->groupBy(DB::raw($exprSql));
        $query->groupBy(DB::raw($labelExpr)); // <-- add this

$rateSql = $this->getCurrencyRateSql($validated['target_currency'] ?? 'IQD');

$query->addSelect(DB::raw("
    SUM(
        ROUND(
            JSON_UNQUOTE(JSON_EXTRACT(JSON_UNQUOTE($field), '$.paidAmount'))
            * ($rateSql)
        )
    ) AS paidAmount
"));

$query->addSelect(DB::raw("
    SUM(
        ROUND(
            JSON_UNQUOTE(JSON_EXTRACT(JSON_UNQUOTE($field), '$.returnAmount'))
            * ($rateSql)
        )
    ) AS returnAmount
"));


if ($this->tableName !== 'inventory_inventory' && $this->tableName !== 'users' && $this->tableName !== 'user_statement') {
    $query->addSelect(DB::raw("
        SUM(
            ROUND(totalAmount * ($rateSql))
        ) AS totalAmount
    "));
}




        return;
    }

        // JSON groupby: set context and add aggregate selects
        if ($operator === 'groupby') {
            if ($skipGroupby) {
                return; // skip in detail query
            }
        $this->hasGroupby = true;

            $this->groupByContext = [
                'field' => $field,
                'jsonPath' => $jsonPath,
            ];

            // Group key
            $exprSql = "JSON_UNQUOTE(JSON_EXTRACT($field, '$jsonPath'))";
            $query->addSelect(DB::raw("$exprSql as customer_name"));
            $query->groupBy(DB::raw($exprSql));



$rateSql = $this->getCurrencyRateSql($validated['target_currency'] ?? 'IQD');

$query->addSelect(DB::raw("
    SUM(
        ROUND(
            JSON_UNQUOTE(JSON_EXTRACT(JSON_UNQUOTE($field), '$.paidAmount'))
            * ($rateSql)
        )
    ) AS paidAmount
"));

$query->addSelect(DB::raw("
    SUM(
        ROUND(
            JSON_UNQUOTE(JSON_EXTRACT(JSON_UNQUOTE($field), '$.returnAmount'))
            * ($rateSql)
        )
    ) AS returnAmount
"));


if ($this->tableName !== 'inventory_inventory' && $this->tableName !== 'users' && $this->tableName !== 'user_statement') {
    $query->addSelect(DB::raw("
        SUM(
            ROUND(totalAmount * ($rateSql))
        ) AS totalAmount
    "));
}






            return;
        }

        // Regular JSON filter
        $jsonUnquote = DB::raw("JSON_UNQUOTE(JSON_EXTRACT($field, '$jsonPath'))");
        $method = $andOr === 'or' ? 'orWhere' : 'where';
        $query->{$method}($jsonUnquote, $operator, $this->formatValue($operator, $value));
    }

    

protected function getCurrencyRateSql(string $targetCurrency = 'IQD'): string
{
    $targetCurrency = addslashes($targetCurrency);

    // Invoice currency code:
    // main is STRING JSON -> parse -> get $.currency (STRING JSON) -> parse -> get $.code
    $srcCode = "
        JSON_UNQUOTE(
            JSON_EXTRACT(
                JSON_UNQUOTE(
                    JSON_EXTRACT(JSON_UNQUOTE(main), '$.currency')
                ),
                '$.code'
            )
        )
    ";

    // Latest settings JSON (main is STRING JSON)
    $settings = "(SELECT JSON_UNQUOTE(main) FROM setting WHERE deleted_at IS NULL ORDER BY id DESC LIMIT 1)";

    // Helper: path to rate_to_iqd for a code inside settings list
    $srcRatePath = "
        REPLACE(
            JSON_UNQUOTE(
                JSON_SEARCH(
                    {$settings},
                    'one',
                    {$srcCode},
                    NULL,
                    '$.currency.list[*].code'
                )
            ),
            '.code',
            '.rate_to_iqd'
        )
    ";

    $tgtRatePath = "
        REPLACE(
            JSON_UNQUOTE(
                JSON_SEARCH(
                    {$settings},
                    'one',
                    '{$targetCurrency}',
                    NULL,
                    '$.currency.list[*].code'
                )
            ),
            '.code',
            '.rate_to_iqd'
        )
    ";

    // r(code) = code-per-IQD (from settings)
    $srcRate = "
        CAST(
            JSON_UNQUOTE(
                JSON_EXTRACT({$settings}, {$srcRatePath})
            ) AS DECIMAL(18,8)
        )
    ";

    $tgtRate = "
        CAST(
            JSON_UNQUOTE(
                JSON_EXTRACT({$settings}, {$tgtRatePath})
            ) AS DECIMAL(18,8)
        )
    ";

    // multiplier = r(target) / r(source)
    // if target=IQD => r(target)=1 => multiplier = 1 / r(source) (correct)
    return "
        CASE
            WHEN {$srcCode} = '{$targetCurrency}' THEN 1
            ELSE COALESCE(
                ({$tgtRate} / NULLIF({$srcRate}, 0)),
                1
            )
        END
    ";
}








}
