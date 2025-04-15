<?php
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\MaterialController;
use App\Http\Controllers\API\SupplierController;
use App\Http\Controllers\API\ColorController;
use App\Http\Controllers\API\BannerController;
use App\Http\Controllers\API\InventoryCheckController;
use App\Http\Controllers\API\SizeController;
use App\Http\Controllers\API\TagController;
use App\Http\Controllers\API\PurchaseOrderController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\SupportRequestController;
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
    Route::middleware(['api.key'])->group(function () {
        Route::prefix('cart')->group(function () {
            Route::get('/', [CartController::class, 'index'])->name('apicart.index');
            Route::post('/add', [CartController::class, 'add'])->name('apicarttest.add');
            Route::put('/{cartItem}', [CartController::class, 'update'])->name('apicart.update');
            Route::delete('/{cartItem}', [CartController::class, 'remove'])->name('apicart.remove');
            Route::delete('/', [CartController::class, 'clear'])->name('apicart.clear');
        });
    });
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/featured', [CategoryController::class, 'featured']);
    Route::get('/colors', [ColorController::class, 'index']);
    Route::get('/colors/{id}', [ColorController::class, 'show']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/all', [ProductController::class, 'all']);
    Route::get('/materials', [MaterialController::class, 'index']);
    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::get('/sizes', [SizeController::class, 'index']);
    Route::get('/tags', [TagController::class, 'index']);
    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
    Route::get('/purchase-orders/{purchaseorderId}', [PurchaseOrderController::class, 'show']);
    Route::get('/inventory-checks', [InventoryCheckController::class, 'index']);
    Route::get('/inventory-checks/{checkId}', [InventoryCheckController::class, 'show']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{orderId}', [OrderController::class, 'show']);

    Route::get('/banners', [BannerController::class, 'index']);
    Route::get('/banners/active', [BannerController::class, 'getActiveBanners']);

    Route::get('/support-requests', [SupportRequestController::class, 'index']);
    Route::get('/support-requests/{id}', [SupportRequestController::class, 'show']);

    Route::get('/supplier', [SupplierController::class, 'index']);
});
