<?php

namespace App\Http\Controllers;

// use App\Models\User;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Hash;
// use Illuminate\Support\Facades\Validator;
// use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
// use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FiltersController extends Controller
{
    public function test()
    {

        return response()->json(['Status' => 'Online']);

    }
}

// public function dynamicSearch(Request $request)
// {

//     //         if ($request->tableName=="users") {
//     // return response()->json(['error' => 'not found'], 404);
//     //          }

//     $validated = $request->all(); // $this->validateRequest($request);
//     //  $query = User::query();
//     $query = DB::table($request->tableName);
//     //     return response()->json([
//     //     'status' => 'success',
//     //     'data' => $request
//     // ]);

//     // تطبيق العلاقات
//     // $this->applyRelations($query, $validated);

//     // تطبيق الفلاتر
//     $this->applyFilters($query, $validated);

//     // تطبيق الترتيب
//     $this->applySorting($query, $validated);

//     // تطبيق Pagination
//     return $this->paginateResults($query, $validated);
// }

// protected function validateRequest(Request $request)
// {
//     return $request->validate([
//         'filters' => 'sometimes|array',
//         'filters.*.field' => 'required|string|in:name,email,age,role',
//         'filters.*.operator' => 'required|string|in:=,!=,>,<,>=,<=,like,not like,in,not in',
//         'filters.*.value' => 'required',
//         'sort_by' => 'sometimes|string|in:name,email,created_at',
//         'sort_dir' => 'sometimes|in:asc,desc',
//         'per_page' => 'sometimes|integer|min:1|max:100',
//         'relations' => 'sometimes|array',
//         'relations.*' => 'string|in:profile,posts,comments',
//     ]);
// }

// protected function applyRelations($query, $validated)
// {
//     if (! empty($validated['relations'])) {
//         $query->with($validated['relations']);
//     }
// }

// protected function applyFilters($query, $validated)
// {
//     if (empty($validated['filters'])) {
//         return;
//     }

//     foreach ($validated['filters'] as $filter) {
//         $this->applySingleFilter($query, $filter);
//     }
// }

// protected function applySingleFilter($query, $filter)
// {
//     $field = $filter['field'];
//     $operator = $filter['operator'];
//     $value = $filter['value'];
//     $type = $filter['type'];

//     if ($operator === 'in' || $operator === 'not in') {
//         $query->whereIn($field, explode(',', $value), $operator === 'not in' ? 'not' : 'and');
//     } elseif ($type === 'or') {
//         $query->orWhere($field,
//             $operator,
//             $this->formatValue($operator, $value));
//     } else {
//         $query->where($field, $operator, $this->formatValue($operator, $value));
//     }
// }

// protected function formatValue($operator, $value)
// {
//     if ($operator === 'like' || $operator === 'not like') {
//         return '%'.$value.'%';
//     }

//     return $value;
// }

// protected function applySorting($query, $validated)
// {
//     if (! empty($validated['sort_by'])) {
//         $direction = $validated['sort_dir'] ?? 'desc'; // 'asc';
//         $query->orderBy($validated['sort_by'], $direction);
//     }
// }

// protected function paginateResults($query, $validated)
// {
//     $perPage = $validated['per_page'] ?? 15;

//     return $query->whereNull('deleted_at')->paginate($perPage)->appends($validated);
// }

// whereNull   whereNotNull
// {
//   "filters": [
//     {
//       "field": "name",
//       "operator": "like",
//       "value": "John",
//       "type":"and"
//     },
//     {
//       "field": "id",
//       "operator": "<",
//       "value": "3",
//       "type":"or"
//     }
//   ],
//   "sort_by": "created_at",
//   "tableName":"users",
//  // "sort_dir": "desc",
//   "per_page": 10,
//   "relations": []
// }
