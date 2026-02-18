<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdvancedFilterController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FiltersController;
use App\Http\Controllers\OperationController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\TreasuryConversionController;

Route::get('/test', [FiltersController::class, 'test']);
Route::post('/upload', [OperationController::class, 'upload']);
Route::delete('/files/{path}', [OperationController::class, 'unUpload']);
Route::post('/addData/{tableName}', [OperationController::class, 'add']);
Route::patch('/updateData/{tableName}/{condition}/{conditionValue}', [OperationController::class, 'update']);
Route::post('/advancedFilter', [AdvancedFilterController::class, 'advancedFilter']);
Route::post('/addWithUpload/{tableName}', [OperationController::class, 'addWithUpload']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/getUser', [AuthController::class, 'getUser']);
    Route::post('/register-tenant', [RegisterController::class, 'register']);

    Route::post('/refreshToken', [AuthController::class, 'refreshToken']);
    Route::post('/resetPassword', [AuthController::class, 'resetPassword']);
    Route::post('/forgotPassword', [AuthController::class, 'forgotPassword']);
    Route::middleware('auth.jwt')->group(function () {
        Route::patch('/update/{id}', [AuthController::class, 'update']);
        Route::post('/advancedFilter', [AdvancedFilterController::class, 'advancedFilter']);

        // Route::patch('/updateData/{tableName}/{condition}/{conditionValue}', [OperationController::class, 'update']);

    });
});

// Treasury Conversion Routes
Route::prefix('treasury-conversions')->group(function () {
    Route::get('/', [TreasuryConversionController::class, 'index']);
    Route::post('/', [TreasuryConversionController::class, 'store']);
    Route::get('/active-safes', [TreasuryConversionController::class, 'getActiveSafes']);
    Route::get('/{id}', [TreasuryConversionController::class, 'show']);
    Route::delete('/{id}', [TreasuryConversionController::class, 'destroy']);
});

// Route::get('/getMyUser', [AuthController::class, 'getMyUser']);
// Route::post('/getUserById', [AuthController::class, 'getUserById']);
// Route::post('/getAllUser', [AuthController::class, 'getAllUser']);
// // Route::post('/adminlogin', [AuthController::class, 'adminlogin']);
// Route::post('/dynamicSearch', [FiltersController::class, 'dynamicSearch']);
