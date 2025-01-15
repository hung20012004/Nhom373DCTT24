<?php

use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ProductController as APIProductController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/products', [APIProductController::class, 'index']);
    Route::get('/products/featured', [APIProductController::class, 'featured']);
});

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::apiResource('products', AdminProductController::class);
    Route::get('categories', [CategoryController::class, 'index']);
    // Route::get('materials', [MaterialController::class, 'index']);
    // Route::get('tags', [TagController::class, 'index']);
    // Route::get('sizes', [SizeController::class, 'index']);
    // Route::get('colors', [ColorController::class, 'index']);
});
