<?php

use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\MaterialController;
use App\Http\Controllers\API\SupplierController;
use App\Http\Controllers\API\ColorController;
use App\Http\Controllers\API\WishlistController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\SizeController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Routes API công khai
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::post('/categories/{categoryId}', [CategoryController::class, 'update']);
    Route::delete('/categories/{categoryId}', [CategoryController::class, 'destroy']);

    Route::get('/colors', [ColorController::class, 'index']);
    Route::post('/colors', [ColorController::class, 'store']);
    Route::post('/colors/{colorId}', [ColorController::class, 'update']);
    Route::delete('/colors/{colorId}', [ColorController::class, 'destroy']);

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/materials', [MaterialController::class, 'index']);
    Route::get('/suppliers', [SupplierController::class, 'index']);

    Route::get('/sizes', [SizeController::class, 'index']);
    Route::post('/sizes', [SizeController::class, 'store']);
    Route::post('/sizes/{sizeId}', [SizeController::class, 'update']);
    Route::delete('/sizes/{sizeId}', [SizeController::class, 'destroy']);

    Route::get('/tags', [TagController::class, 'index']);
    Route::post('/tags', [TagController::class, 'store']);
    Route::post('/tags/{tagId}', [TagController::class, 'update']);
    Route::delete('/tags/{tagId}', [TagController::class, 'destroy']);

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle/{productId}', [WishlistController::class, 'toggle']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'remove']);
    Route::delete('/wishlist', [WishlistController::class, 'clear']);
    Route::get('/wishlist/check/{productId}', [WishlistController::class, 'check']);

    Route::get('/banners/active', [BannerController::class, 'getActiveBanners']);
    Route::post('/banners', [BannerController::class, 'store'])->middleware('auth:sanctum');
});


