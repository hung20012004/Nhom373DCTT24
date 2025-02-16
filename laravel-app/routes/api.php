<?php

use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\MaterialController;
use App\Http\Controllers\API\SupplierController;
use App\Http\Controllers\API\ColorController;
use App\Http\Controllers\API\WishlistController;
use App\Http\Controllers\API\BannerController;
use App\Http\Controllers\API\SizeController;
use App\Http\Controllers\API\TagController;
use App\Http\Controllers\API\CartController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Routes API công khai
    Route::get('/categories', [CategoryController::class, 'index']);

    Route::get('/colors', [ColorController::class, 'index']);

    Route::get('/products', [ProductController::class, 'index']);

    Route::get('/materials', [MaterialController::class, 'index']);

    Route::get('/suppliers', [SupplierController::class, 'index']);

    Route::get('/sizes', [SizeController::class, 'index']);

    Route::get('/tags', [TagController::class, 'index']);

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle/{productId}', [WishlistController::class, 'toggle']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'remove']);
    Route::delete('/wishlist', [WishlistController::class, 'clear']);
    Route::get('/wishlist/check/{productId}', [WishlistController::class, 'check']);

    Route::get('/banners/active', [BannerController::class, 'getActiveBanners']);
    Route::post('/banners', [BannerController::class, 'store'])->middleware('auth:sanctum');

    Route::get('/cart', [CartController::class, 'index']);
    Route::middleware(['auth:sanctum', 'verified'])->group(function () {
        Route::post('/cart/add', [CartController::class, 'add']);
        Route::put('/cart/{cart}', [CartController::class, 'update']);
        Route::delete('/cart/{cart}', [CartController::class, 'remove']);
    });
});
