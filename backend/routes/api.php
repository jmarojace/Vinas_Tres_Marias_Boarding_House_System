<?php

use App\Http\Controllers\Api\RentalApiController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [RentalApiController::class, 'login'])->middleware('throttle:6,1');
Route::post('/register', [RentalApiController::class, 'register'])->middleware('throttle:4,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [RentalApiController::class, 'logout']);
    Route::get('/me', [RentalApiController::class, 'me']);
    Route::get('/notifications', [RentalApiController::class, 'notifications']);
    Route::get('/tenant-portal', [RentalApiController::class, 'tenantPortal'])->middleware('role:tenant');
    Route::post('/tenant-maintenance', [RentalApiController::class, 'submitMaintenance'])->middleware('role:tenant');
    Route::middleware('role:admin,staff')->group(function () {
        Route::get('/snapshot', [RentalApiController::class, 'snapshot']);
        Route::put('/snapshot', [RentalApiController::class, 'snapshot']);
        Route::patch('/maintenance/{id}', [RentalApiController::class, 'updateMaintenance']);
    });
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', [RentalApiController::class, 'users']);
        Route::post('/users', [RentalApiController::class, 'users']);
        Route::patch('/users/{user}', [RentalApiController::class, 'updateUser']);
        Route::delete('/maintenance/{id}', [RentalApiController::class, 'deleteMaintenance']);
    });
});
