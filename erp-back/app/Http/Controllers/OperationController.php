<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OperationController extends Controller
{
    public function add(Request $request, $tableName)
    {
        if ($tableName == 'users') {
            return response()->json(['error' => 'not found'], 404);
        }
        $id = DB::table($tableName)->insertGetId($request->all());

        return response()->json([
            'id' => $id,
        ]);
    }

    public function update(Request $request, $tableName, $condition, $conditionValue)
    {
        if ($tableName == 'users') {
            return response()->json(['error' => 'not found'], 404);
        }
        $data = DB::table($tableName)->where($condition, $conditionValue)->update($request->all());

        return response()->json([
            'data' => $data,
        ]);
    }

    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'files.*' => 'required|file|max:10240', // 10MB max per file

        ]);
        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors(),
            ], 422);
        }
        $uploadedFiles = [];
        $clientId = $request->header('x-client');
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $mimeType = $file->getMimeType();
                $size = $file->getSize();
                $filename = Str::random(20).'_'.time().'.'.$extension;
                $path = $file->storeAs($clientId, $filename, 'public');
                // $path = $file->store('uploads', 'public'); // storage/app/public/uploads 'attachments'
                $uploadedFiles[] = [
                    'original_name' => $originalName,
                    'url' => asset('storage/'.$path),
                    'mime_type' => $mimeType,
                    'size' => $size,
                ];
            }
        }

        return response()->json([
            'message' => 'Files uploaded successfully',
            'files' => $uploadedFiles,
        ], 201);
    }

    public function addWithUpload(Request $request, $tableName = null)
    {
        // ---------- Files (optional) ----------
        $files = $request->file('files');
        if ($files && ! is_array($files)) {
            $files = [$files];
        }

        $uploadedFiles = [];
        if ($files) {
            $fileValidator = Validator::make(
                ['files' => $files],
                [
                    'files' => 'required|array',
                    'files.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
                ]
            );
            if ($fileValidator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $fileValidator->errors(),
                ], 422);
            }

            // $clientId = $request->header('x-client', 'uploads');
            $clientId = $request->header('x-client');

            foreach ($files as $file) {
                if (! $file) {
                    continue;
                }
                $originalName = $file->getClientOriginalName();
                $ext = $file->getClientOriginalExtension();
                $mime = $file->getMimeType();
                $size = $file->getSize();

                $filename = Str::random(20).'_'.time().'.'.$ext;
                $path = $file->storeAs($clientId, $filename, 'public');

                $uploadedFiles[] = [
                    'original_name' => $originalName,
                    'filename' => $filename,
                    'url' => asset('storage/'.$path),
                    'mime_type' => $mime,
                    'size' => $size,
                ];
            }
        }

        // ---------- Items (single or multiple) ----------
        $items = $request->input('items');

        // If items comes as a JSON string (FormData), decode it
        if (is_string($items)) {
            $decoded = json_decode($items, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $items = $decoded;
            } else {
                return response()->json([
                    'error' => 'Invalid JSON in items',
                    'message' => json_last_error_msg(),
                ], 422);
            }
        }

        if (is_null($items)) {
            $items = [$request->except('items', 'files')];
        }
        if (! is_array($items) || Arr::isAssoc($items)) {
            $items = [$items];
        }
        $items = array_values(array_filter($items, fn ($row) => is_array($row) && ! empty($row)));
        if (empty($items)) {
            return response()->json(['error' => 'No valid payload provided'], 422);
        }

        $multipleRows = count($items) > 1;
        $results = [];
        $previousId = null;

        DB::beginTransaction();
        try {
            foreach ($items as $item) {
                // Resolve table
                $targetTable = $item['table'] ?? $tableName;
                if (! $targetTable) {
                    throw new \InvalidArgumentException('Table name is required for each item or via route parameter.');
                }
                if ($targetTable === 'users') {
                    throw new \InvalidArgumentException('not found');
                }

                // Extract row data and link key
                $linkKey = $item['linkKey'] ?? 'previous_id';
                $row = $item['data'] ?? $item; // if data exists, use it; else whole item
                unset($row['table'], $row['linkKey']);

                // Chain previous id into this row (unless first row)
                if ($previousId !== null) {
                    //  $row[$linkKey] = $previousId;
                }

                // Attachments
                if (! empty($uploadedFiles)) {
                    if (! $multipleRows) {
                        $row['attachments'] = json_encode(['images' => $uploadedFiles]);
                    } else {
                        $imageName = null;
                        if (isset($row['main'])) {
                            $decodedMain = json_decode($row['main'], true);
                            if (json_last_error() === JSON_ERROR_NONE) {
                                $imageName = $decodedMain['imageName'] ?? null;
                            }
                        }
                        $filtered = $uploadedFiles;
                        if ($imageName) {
                            $filtered = array_values(array_filter(
                                $uploadedFiles,
                                fn ($img) => ($img['original_name'] ?? null) === $imageName
                            ));
                        } else {
                            $filtered = [];
                        }
                        $row['attachments'] = json_encode(['images' => $filtered]);
                    }
                }

                // Insert
                $id = DB::table($targetTable)->insertGetId($row);
                $results[] = ['table' => $targetTable, 'id' => $id];
                $previousId = $id; // pass to next row
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            $status = $e instanceof \InvalidArgumentException ? 404 : 500;

            return response()->json([
                'error' => 'Insert failed',
                'message' => $e->getMessage(),
            ], $status);
        }

        return response()->json([
            'message' => 'Inserted successfully',
            'results' => $results,
            'files' => $uploadedFiles,
        ], 201);
    }

    // public function addWithUpload(Request $request, $tableName = null)
    // {
    //     // -------- Handle files (optional) --------
    //     $files = $request->file('files');
    //     if ($files && !is_array($files)) {
    //         $files = [$files]; // normalize
    //     }

    //     $uploadedFiles = [];
    //     if ($files) {
    //         $fileValidator = Validator::make(
    //             ['files' => $files],
    //             [
    //                 'files'   => 'required|array',
    //                 'files.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB per file
    //             ]
    //         );

    //         if ($fileValidator->fails()) {
    //             return response()->json([
    //                 'error' => 'Validation failed',
    //                 'messages' => $fileValidator->errors(),
    //             ], 422);
    //         }

    //       //  $clientId = $request->header('x-client', 'uploads');
    //           $clientId = $request->header('x-client');

    //         foreach ($files as $file) {
    //             if (!$file) {
    //                 continue;
    //             }

    //             $originalName = $file->getClientOriginalName();
    //             $extension    = $file->getClientOriginalExtension();
    //             $mimeType     = $file->getMimeType();
    //             $size         = $file->getSize();

    //             $filename = Str::random(20) . '_' . time() . '.' . $extension;
    //             $path = $file->storeAs($clientId, $filename, 'public');

    //             $uploadedFiles[] = [
    //                 'original_name' => $originalName,
    //                 'filename'      => $filename,
    //                 'url'           => asset('storage/' . $path),
    //                 'mime_type'     => $mimeType,
    //                 'size'          => $size,
    //             ];
    //         }
    //     }

    //     // -------- Normalize items (single or multiple) --------
    //     $items = $request->input('items');

    //     if (is_null($items)) {
    //         // Single-row fallback: use all request fields except files/items
    //         $items = [ $request->except('items', 'files') ];
    //     }

    //     if (!is_array($items) || Arr::isAssoc($items)) {
    //         $items = [$items];
    //     }

    //     // Clean / ensure non-empty rows
    //     $items = array_values(array_filter($items, fn ($row) => is_array($row) && !empty($row)));
    //     if (empty($items)) {
    //         return response()->json(['error' => 'No valid payload provided'], 422);
    //     }

    //     $multipleRows = count($items) > 1;
    //     $results = [];

    //     DB::beginTransaction();
    //     try {
    //         foreach ($items as $row) {
    //             // Determine table per row (item.table overrides route param)
    //             $targetTable = $row['table'] ?? $tableName;
    //             if (!$targetTable) {
    //                 throw new \InvalidArgumentException('Table name is required for each item or via route parameter.');
    //             }
    //             if ($targetTable === 'users') {
    //                 throw new \InvalidArgumentException('not found');
    //             }

    //             // Strip control key
    //             unset($row['table']);

    //             // Attachment logic:
    //             // - If only one row total: attach ALL uploaded files
    //             // - If multiple rows: filter by JSON-parsed main.imageName
    //             if (!empty($uploadedFiles)) {
    //                 if (!$multipleRows) {
    //                     $row['attachments'] = json_encode(['images' => $uploadedFiles]);
    //                 } else {
    //                     $imageName = null;
    //                     if (isset($row['main'])) {
    //                         $decodedMain = json_decode($row['main'], true);
    //                         if (json_last_error() === JSON_ERROR_NONE) {
    //                             $imageName = $decodedMain['imageName'] ?? null;
    //                         }
    //                     }

    //                     $filtered = $uploadedFiles;
    //                     if ($imageName) {
    //                         $filtered = array_values(array_filter(
    //                             $uploadedFiles,
    //                             fn ($img) => ($img['original_name'] ?? null) === $imageName
    //                         ));
    //                     } else {
    //                         // If no imageName present in this row, fallback to empty attachment
    //                         $filtered = [];
    //                     }

    //                     $row['attachments'] = json_encode(['images' => $filtered]);
    //                 }
    //             }

    //             // Insert and collect id with table reference
    //             $id = DB::table($targetTable)->insertGetId($row);
    //             $results[] = [
    //                 'table' => $targetTable,
    //                 'id'    => $id,
    //             ];
    //         }

    //         DB::commit();
    //     } catch (\Throwable $e) {
    //         DB::rollBack();
    //         $status = $e instanceof \InvalidArgumentException ? 404 : 500;
    //         return response()->json([
    //             'error'   => 'Insert failed',
    //             'message' => $e->getMessage(),
    //         ], $status);
    //     }

    //     return response()->json([
    //         'message' => 'Inserted successfully',
    //         'results' => $results,
    //         'files'   => $uploadedFiles, // return upload metadata to the client
    //     ], 201);
    // }

    // public function unUpload($path)
    // {
    //     if (Storage::disk('public')->exists($path)) {
    //         Storage::disk('public')->delete($path);
    //     }
    //     return response()->json(['message' => 'File deleted successfully']);
    // }

    // public function addWithUpload(Request $request, $tableName)
    // {
    //     if ($tableName === 'users') {
    //         return response()->json(['error' => 'not found'], 404);
    //     }

    //     // --- Handle files (optional) ---
    //     $files = $request->file('files');
    //     if ($files && ! is_array($files)) {
    //         $files = [$files]; // normalize
    //     }

    //     $uploadedFiles = [];
    //     if ($files) {
    //         $fileValidator = Validator::make(
    //             ['files' => $files],
    //             [
    //                 'files' => 'required|array',
    //                 'files.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB per file
    //             ]
    //         );

    //         if ($fileValidator->fails()) {
    //             return response()->json([
    //                 'error' => 'Validation failed',
    //                 'messages' => $fileValidator->errors(),
    //             ], 422);
    //         }

    //         $clientId = $request->header('x-client', 'uploads');
    //         foreach ($files as $file) {
    //             if (! $file) {
    //                 continue;
    //             }
    //             $originalName = $file->getClientOriginalName();
    //             $extension    = $file->getClientOriginalExtension();
    //             $mimeType     = $file->getMimeType();
    //             $size         = $file->getSize();

    //             $filename = Str::random(20) . '_' . time() . '.' . $extension;
    //             $path = $file->storeAs($clientId, $filename, 'public');

    //             $uploadedFiles[] = [
    //                 'original_name' => $originalName,
    //                 'filename'      => $filename,
    //                 'url'           => asset('storage/' . $path),
    //                 'mime_type'     => $mimeType,
    //                 'size'          => $size,
    //             ];
    //         }
    //     }

    //     // --- Handle data insert (single or multiple) ---
    //     // Accept single payload or array of payloads under "items"
    //     $items = $request->input('items');
    //     if (is_null($items)) {
    //         $items = [$request->except('items', 'files')]; // fallback single record
    //     }
    //     if (! is_array($items) || Arr::isAssoc($items)) {
    //         $items = [$items];
    //     }

    //     // Clean and ensure non-empty rows
    //     $items = array_values(array_filter($items, fn ($row) => is_array($row) && ! empty($row)));
    //     if (empty($items)) {
    //         return response()->json(['error' => 'No valid payload provided'], 422);
    //     }

    //     // If files were uploaded, add attachments JSON to each row
    //     if (! empty($uploadedFiles)) {
    //         foreach ($items as &$row) {
    //             // Optional: if you want to filter images per row based on some field (e.g., $row['imageFileName']),
    //             // apply your filter here. By default we attach all uploaded images.
    //             $row['attachments'] = json_encode([
    //                 'images' => $uploadedFiles,
    //             ]);
    //         }
    //         unset($row);
    //     }

    //     $ids = [];
    //     DB::beginTransaction();
    //     try {
    //         foreach ($items as $row) {
    //             $ids[] = DB::table($tableName)->insertGetId($row);
    //         }
    //         DB::commit();
    //     } catch (\Throwable $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'error'   => 'Insert failed',
    //             'message' => $e->getMessage(),
    //         ], 500);
    //     }

    //     return response()->json([
    //         'message' => 'Inserted successfully',
    //         'ids'     => $ids,
    //         'count'   => count($ids),
    //         'files'   => $uploadedFiles, // so the client still receives upload metadata
    //     ], 201);
    // }

    // public function addMultiple(Request $request, $tableName)
    // {
    //     if ($tableName === 'users') {
    //         return response()->json(['error' => 'not found'], 404);
    //     }

    //     // Accept either:
    //     // - a single payload (same as before), or
    //     // - an array of payloads under "items"
    //     $items = $request->input('items');

    //     if (is_null($items)) {
    //         $items = [$request->all()]; // single record fallback
    //     }

    //     if (!is_array($items) || Arr::isAssoc($items)) {
    //         // Ensure we have an array of associative arrays
    //         $items = [$items];
    //     }

    //     // Optional: basic guard to avoid empty inserts
    //     $items = array_filter($items, fn ($row) => is_array($row) && !empty($row));
    //     if (empty($items)) {
    //         return response()->json(['error' => 'No valid payload provided'], 422);
    //     }

    //     $ids = [];
    //     DB::beginTransaction();
    //     try {
    //         foreach ($items as $row) {
    //             // Insert each row and collect its ID
    //             $ids[] = DB::table($tableName)->insertGetId($row);
    //         }
    //         DB::commit();
    //     } catch (\Throwable $e) {
    //         DB::rollBack();
    //         return response()->json([
    //             'error' => 'Insert failed',
    //             'message' => $e->getMessage(),
    //         ], 500);
    //     }

    //     return response()->json([
    //         'ids' => $ids,
    //         'count' => count($ids),
    //     ], 201);
    // }

}
