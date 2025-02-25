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
use App\Http\Controllers\API\CustomerController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;

Route::get('/provinces', function () {
    $response = Http::get('https://provinces.open-api.vn/api/p/');
    return $response->json();
});

Route::get('/districts/{provinceCode}', function ($provinceCode) {
    $response = Http::get("https://provinces.open-api.vn/api/p/{$provinceCode}?depth=2");
    return $response->json();
});

Route::get('/wards/{districtCode}', function ($districtCode) {
    $response = Http::get("https://provinces.open-api.vn/api/d/{$districtCode}?depth=2");
    return $response->json();
});

Route::prefix('v1')->group(function () {
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/{id}', [CustomerController::class, 'show']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/featured', [CategoryController::class, 'featured']);

    Route::get('/colors', [ColorController::class, 'index']);

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);

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
});
