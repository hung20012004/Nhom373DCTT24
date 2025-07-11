<?php
use App\Http\Controllers\API\CategoryController;
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
// ------
use App\Http\Controllers\Admin\BannerController as AdminBannerController;
use App\Http\Controllers\Customer\CartController as AdminCartController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\WishlistController;
use App\Http\Controllers\Customer\ShippingAddressController;
use App\Http\Controllers\Customer\ProductReviewController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ApiKeyController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\ColorController as AdminColorController;
use App\Http\Controllers\Admin\InventoryCheckController as AdminInventoryCheckController;
use App\Http\Controllers\Admin\MaterialController as AdminMaterialController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\SizeController as AdminSizeController;
use App\Http\Controllers\Admin\SupplierController as AdminSupplierController;
use App\Http\Controllers\Admin\TagController as AdminTagController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\PurchaseOrderController as AdminPurchaseOrderController;
use App\Http\Controllers\Admin\OrderController AS AdminOrder;
use App\Http\Controllers\Admin\SupportRequestController as AdminSupportRequestController;
use App\Http\Controllers\Customer\SupportRequestController as CustomerSupportRequestController;


// These routes should be directly under the /api prefix
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
Route::prefix('v2')->group(function () {
    Route::middleware(['api.key'])->prefix('admin')->group(function () {
        Route::prefix('purchase-orders')->group(function () {
            Route::post('/', [AdminPurchaseOrderController::class, 'store']);
            Route::put('/{purchaseorderId}', [AdminPurchaseOrderController::class, 'update']);
            Route::put('/{purchaseorderId}/status', [AdminPurchaseOrderController::class, 'updateStatus']);
            Route::delete('/{purchaseorderId}', [AdminPurchaseOrderController::class, 'destroy']);
        });
        Route::prefix('inventory-checks')->group(function () {
            Route::post('/', [AdminInventoryCheckController::class, 'store']);
            Route::put('/{checkId}', [AdminInventoryCheckController::class, 'update']);
            Route::put('/{checkId}/status', [AdminInventoryCheckController::class, 'updateStatus']);
            Route::delete('/{checkId}', [AdminInventoryCheckController::class, 'destroy']);
        });
        Route::prefix('orders')->group(function () {
            Route::put('/{orderId}', [AdminOrder::class, 'update']);
            Route::put('/{orderId}/status', [AdminOrder::class, 'updateStatus']);
            Route::put('/{orderId}/payment-status', [AdminOrder::class, 'updatePaymentStatus']);
        });
        Route::prefix('categories')->group(function () {
            Route::post('/', [AdminCategoryController::class, 'store']);
            Route::post('/{categoryId}', [AdminCategoryController::class, 'update']);
            Route::delete('/{categoryId}', [AdminCategoryController::class, 'destroy']);
        });
        Route::prefix('colors')->group(function () {
            Route::post('/', [AdminColorController::class, 'store']);
            Route::post('/{colorId}', [AdminColorController::class, 'update']);
            Route::delete('/{colorId}', [AdminColorController::class, 'destroy']);
        });
        Route::prefix('products')->group(function () {
            Route::post('/', [AdminProductController::class, 'store']);
            Route::post('/{productId}', [AdminProductController::class, 'update']);
            Route::delete('/{productId}', [AdminProductController::class, 'destroy']);
        });
        Route::prefix('materials')->group(function () {
            Route::post('/', [AdminMaterialController::class, 'store']);
            Route::post('/{materialId}', [AdminMaterialController::class, 'update']);
            Route::delete('/{materialId}', [AdminMaterialController::class, 'destroy']);
        });
        Route::prefix('suppliers')->group(function () {
            Route::post('/', [AdminSupplierController::class, 'store']);
            Route::post('/{supplierId}', [AdminSupplierController::class, 'update']);
            Route::delete('/{supplierId}', [AdminSupplierController::class, 'destroy']);
        });
        Route::prefix('sizes')->group(function () {
            Route::post('/', [AdminSizeController::class, 'store']);
            Route::post('/{sizeId}', [AdminSizeController::class, 'update']);
            Route::delete('/{sizeId}', [AdminSizeController::class, 'destroy']);
        });
        Route::prefix('tags')->group(function () {
            Route::post('/', [AdminTagController::class, 'store']);
            Route::post('/{tagId}', [AdminTagController::class, 'update']);
            Route::delete('/{tagId}', [AdminTagController::class, 'destroy']);
        });
        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::get('/{id}', [UserController::class, 'show']);
            Route::post('/', [UserController::class, 'store']);
            Route::put('/{id}', [UserController::class, 'update']);
            Route::delete('/{id}', [UserController::class, 'destroy']);
        });
        Route::prefix('customers')->group(function () {
            Route::get('/index', [CustomerController::class, 'index']);
            Route::get('/{id}', [CustomerController::class, 'show']);
        });
        Route::prefix('banners')->group(function () {
            Route::post('/', [AdminBannerController::class, 'store']);
            Route::put('/{bannerId}', [AdminBannerController::class, 'update']);
            Route::put('/{bannerId}/toggle-status', [AdminBannerController::class, 'toggleStatus']);
            Route::delete('/{bannerId}', [AdminBannerController::class, 'destroy']);
        });
        Route::prefix('support-requests')->group(function () {
            Route::put('/{id}/status', [AdminSupportRequestController::class, 'updateStatus']);
            Route::delete('/{id}', [AdminSupportRequestController::class, 'destroy']);
        });
    });


    Route::middleware(['api.key'])->group(function () {
        Route::prefix('profile')->group(function () {
            Route::get('/', [ProfileController::class, 'edit'])->name('profile.edit');
            Route::post('/', [ProfileController::class, 'update'])->name('profile.update');
            Route::delete('/', [ProfileController::class, 'destroy'])->name('profile.destroy');
        });
        Route::prefix('cart')->group(function () {
            Route::get('/', [AdminCartController::class, 'index'])->name('cart.index');
            Route::post('/add', [AdminCartController::class, 'add'])->name('cart.add');
            Route::put('/{cartItem}', [AdminCartController::class, 'update'])->name('cart.update');
            Route::delete('/{cartItem}', [AdminCartController::class, 'remove'])->name('cart.remove');
            Route::delete('/', [AdminCartController::class, 'clear'])->name('cart.clear');
        });
        Route::prefix('shipping-addresses')->group(function () {
            Route::get('/', [ShippingAddressController::class, 'index']);
            Route::post('/', [ShippingAddressController::class, 'store']);
            Route::put('/{address}', [ShippingAddressController::class, 'update']);
            Route::delete('/{address}', [ShippingAddressController::class, 'destroy']);
            Route::put('/{address}/set-default', [ShippingAddressController::class, 'setDefault']);
        });
        Route::prefix('order')->group(function () {
            Route::get('/', [CustomerOrderController::class, 'index'])->name('orders.index');
            Route::get('/{order}', [CustomerOrderController::class, 'show'])->name('orders.show');
            Route::get('/confirmation/{order}', [CustomerOrderController::class, 'confirmation'])->name('order.confirmation');
            Route::post('/', [CustomerOrderController::class, 'checkout'])->name('order.checkout');
            Route::post('/{order}/cancel', [CustomerOrderController::class, 'cancel'])->name('orders.cancel');
            Route::post('/{orderId}/confirm-received', [CustomerOrderController::class, 'confirmReceived']);
        });
        Route::prefix('support-requests')->group(function () {
            Route::get('/', [CustomerSupportRequestController::class, 'index'])->name('support-orders.index');
            Route::get('/{order}', [CustomerSupportRequestController::class, 'show'])->name('support-orders.show');
            Route::post('/', [CustomerSupportRequestController::class, 'checkout'])->name('support-order.checkout');
            Route::get('/confirmation/{order}', [CustomerSupportRequestController::class, 'confirmation'])->name('support-order.confirmation');
            Route::post('/{order}/cancel', [CustomerSupportRequestController::class, 'cancel'])->name('support-orders.cancel');
        });
        Route::post('/products/{productId}/reviews', [ProductReviewController::class, 'store']);
        Route::put('/products/{productId}/reviews/{reviewId}', [ProductReviewController::class, 'update']);
        Route::delete('/products/{productId}/reviews/{reviewId}', [ProductReviewController::class, 'destroy']);

    });
    Route::prefix('wishlist')->group(function () {
        Route::get('/', [WishlistController::class, 'index']);
        Route::post('/add', [WishlistController::class, 'add']);
        Route::delete('/{id}', [WishlistController::class, 'remove']);
        Route::delete('/', [WishlistController::class, 'clear']);
        Route::get('/check/{productId}', [WishlistController::class, 'check']);
    });
    Route::prefix('support-requests')->group(function () {
        Route::post('/{orderId}', [AdminSupportRequestController::class, 'store']);
    });
    Route::get('/products/{productId}/reviews', [ProductReviewController::class, 'getProductReviews']);
    Route::get('/products/{productId}/reviews/user', [ProductReviewController::class, 'getUserReview']);
});
