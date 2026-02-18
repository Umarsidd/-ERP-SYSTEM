<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TreasuryConversionController extends Controller
{
    /**
     * Get all treasury conversions with pagination and filters
     */
    public function index(Request $request)
    {
        try {
            $page = $request->input('page', 1);
            $limit = $request->input('limit', 10);
            $offset = ($page - 1) * $limit;

            $query = DB::table('treasury_conversions')
                ->whereNull('deleted_at')
                ->where('isActive', true);

            // Apply filters
            if ($request->has('fromSafeId')) {
                $query->where('fromSafeId', $request->input('fromSafeId'));
            }
            if ($request->has('toSafeId')) {
                $query->where('toSafeId', $request->input('toSafeId'));
            }
            if ($request->has('status')) {
                $query->where('status', $request->input('status'));
            }
            if ($request->has('dateFrom')) {
                $query->where('conversionDate', '>=', $request->input('dateFrom'));
            }
            if ($request->has('dateTo')) {
                $query->where('conversionDate', '<=', $request->input('dateTo'));
            }

            // Get total count
            $total = $query->count();

            // Get paginated results with safe details
            $conversions = $query
                ->orderBy('id', 'desc')
                ->offset($offset)
                ->limit($limit)
                ->get();

            // Enrich with safe details
            foreach ($conversions as $conversion) {
                $fromSafe = DB::table('bank_accounts')->find($conversion->fromSafeId);
                $toSafe = DB::table('bank_accounts')->find($conversion->toSafeId);

                $conversion->fromSafeName = $fromSafe->name ?? 'Unknown';
                $conversion->toSafeName = $toSafe->name ?? 'Unknown';
            }

            return response()->json([
                'data' => $conversions,
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Failed to fetch conversions',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new treasury conversion with atomic balance updates
     */
    public function store(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'fromSafeId' => 'required|exists:bank_accounts,id',
            'toSafeId' => 'required|exists:bank_accounts,id|different:fromSafeId',
            'amount' => 'required|numeric|gt:0',
            'conversionDate' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            $fromSafeId = $request->input('fromSafeId');
            $toSafeId = $request->input('toSafeId');
            $amount = $request->input('amount');

            // Lock rows for update to prevent race conditions
            $fromSafe = DB::table('bank_accounts')
                ->where('id', $fromSafeId)
                ->lockForUpdate()
                ->first();

            $toSafe = DB::table('bank_accounts')
                ->where('id', $toSafeId)
                ->lockForUpdate()
                ->first();

            // Validate safes exist and are active
            if (!$fromSafe || !$toSafe) {
                throw new \Exception('One or both safes not found');
            }

            if ($fromSafe->status !== 'Active' && $fromSafe->status !== 'Main') {
                throw new \Exception('From safe is not active');
            }

            if ($toSafe->status !== 'Active' && $toSafe->status !== 'Main') {
                throw new \Exception('To safe is not active');
            }

            // Check sufficient balance
            if ($fromSafe->currentBalance < $amount) {
                throw new \Exception('Insufficient balance in source safe');
            }

            // Record balances before conversion
            $fromBalanceBefore = $fromSafe->currentBalance;
            $toBalanceBefore = $toSafe->currentBalance;

            // Calculate new balances
            $fromBalanceAfter = $fromBalanceBefore - $amount;
            $toBalanceAfter = $toBalanceBefore + $amount;

            // Update balances
            DB::table('bank_accounts')
                ->where('id', $fromSafeId)
                ->update([
                    'currentBalance' => $fromBalanceAfter,
                    'totalAmount' => $fromBalanceAfter,
                    'updatedAt' => now()->toISOString(),
                ]);

            DB::table('bank_accounts')
                ->where('id', $toSafeId)
                ->update([
                    'currentBalance' => $toBalanceAfter,
                    'totalAmount' => $toBalanceAfter,
                    'updatedAt' => now()->toISOString(),
                ]);

            // Generate element number
            $latestConversion = DB::table('treasury_conversions')
                ->orderBy('id', 'desc')
                ->first();

            $nextNumber = $latestConversion ? ($latestConversion->id + 1) : 1;
            $elementNumber = 'CONV-' . date('Y') . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

            // Create conversion record
            $conversionData = [
                'elementNumber' => $elementNumber,
                'fromSafeId' => $fromSafeId,
                'toSafeId' => $toSafeId,
                'amount' => $amount,
                'fromSafeBalanceBefore' => $fromBalanceBefore,
                'fromSafeBalanceAfter' => $fromBalanceAfter,
                'toSafeBalanceBefore' => $toBalanceBefore,
                'toSafeBalanceAfter' => $toBalanceAfter,
                'conversionDate' => $request->input('conversionDate'),
                'notes' => $request->input('notes'),
                'status' => 'Completed',
                'isActive' => true,
                'createdAt' => now()->toISOString(),
                'updatedAt' => now()->toISOString(),
                'createdBy' => $request->input('createdBy'),
                'updatedBy' => $request->input('updatedBy'),
                'main' => json_encode($request->all()),
            ];

            $conversionId = DB::table('treasury_conversions')->insertGetId($conversionData);

            DB::commit();

            return response()->json([
                'message' => 'Conversion completed successfully',
                'id' => $conversionId,
                'elementNumber' => $elementNumber,
                'fromSafeBalanceAfter' => $fromBalanceAfter,
                'toSafeBalanceAfter' => $toBalanceAfter,
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Conversion failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single conversion by ID
     */
    public function show($id)
    {
        try {
            $conversion = DB::table('treasury_conversions')
                ->where('id', $id)
                ->whereNull('deleted_at')
                ->first();

            if (!$conversion) {
                return response()->json([
                    'error' => 'Conversion not found',
                ], 404);
            }

            // Get safe details
            $fromSafe = DB::table('bank_accounts')->find($conversion->fromSafeId);
            $toSafe = DB::table('bank_accounts')->find($conversion->toSafeId);

            $conversion->fromSafe = $fromSafe;
            $conversion->toSafe = $toSafe;

            return response()->json([
                'data' => $conversion,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Failed to fetch conversion',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Soft delete a conversion (admin only - does not reverse balances)
     */
    public function destroy($id)
    {
        try {
            $conversion = DB::table('treasury_conversions')
                ->where('id', $id)
                ->whereNull('deleted_at')
                ->first();

            if (!$conversion) {
                return response()->json([
                    'error' => 'Conversion not found',
                ], 404);
            }

            DB::table('treasury_conversions')
                ->where('id', $id)
                ->update([
                    'deleted_at' => now()->toISOString(),
                    'isActive' => false,
                ]);

            return response()->json([
                'message' => 'Conversion deleted successfully',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Failed to delete conversion',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all active safes for conversion selection
     */
    public function getActiveSafes()
    {
        try {
            $safes = DB::table('bank_accounts')
                ->whereNull('deleted_at')
                ->whereIn('status', ['Active', 'Main'])
                ->select('id', 'name', 'type', 'currentBalance', 'currency', 'status')
                ->orderBy('name')
                ->get();

            return response()->json([
                'data' => $safes,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Failed to fetch active safes',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
