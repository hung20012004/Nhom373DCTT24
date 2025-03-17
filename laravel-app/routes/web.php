<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\CheckoutController;
use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\WishlistController;
use App\Http\Controllers\Customer\ShippingAddressController;
use App\Http\Controllers\Customer\ProductReviewController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ColorController;
use App\Http\Controllers\Admin\InventoryCheckController;
use App\Http\Controllers\Admin\MaterialController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SizeController;
use App\Http\Controllers\Admin\SupplierController;
use App\Http\Controllers\Admin\TagController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\PurchaseOrderController;
use App\Http\Controllers\Admin\OrderController AS AdminOrder;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified','check.role'])->name('dashboard');

Route::get('/about', function () {
    return Inertia::render('About');
});
Route::get('/products', function () {
    return Inertia::render('Products');
});

Route::middleware(['auth', 'verified','check.role'])->prefix('admin')->group(function () {
    Route::get('/customers', function () {
        return Inertia::render('Admin/Customers/Index');
    });
    Route::get('/products', function () {
        return Inertia::render('Admin/Products/Index');
    })->name('admin.products');
    Route::get('/materials', function () {
        return Inertia::render('Admin/Materials/Index');
    })->name('admin.materials');
    Route::get('/colors', function () {
        return Inertia::render('Admin/Colors/Index');
    })->name('admin.colors');
    Route::get('/categories', function () {
        return Inertia::render('Admin/Categories/Index');
    })->name('admin.categories');
    Route::get('/staffs', function () {
        return Inertia::render('Admin/Staffs/Index');
    })->name('admin.staffs');
    Route::get('/sizes', function () {
        return Inertia::render('Admin/Sizes/Index');
    })->name('admin.sizes');
    Route::get('/tags', function () {
        return Inertia::render('Admin/Tags/Index');
    })->name('admin.tags');
    Route::get('/suppliers', function () {
        return Inertia::render('Admin/Suppliers/Index');
    })->name('admin.suppliers');
    Route::get('/purchase-orders', function () {
        return Inertia::render('Admin/PurchaseOrders/Index');
    })->name('admin.purchase-orders');
    Route::get('/purchase-orders/{id}', function ($id) {
        return Inertia::render('Admin/PurchaseOrders/Show', ['poId' => $id]);
    })->name('admin.purchase-orders.show');
    Route::get('/inventory-checks', function () {
        return Inertia::render('Admin/InventoryChecks/Index');
    })->name('admin.inventory-checks');
    Route::get('/inventory-checks/{id}', function ($id) {
        return Inertia::render('Admin/InventoryChecks/Show', ['checkId' => $id]);
    })->name('admin.inventory-checks.show');
    Route::get('/orders', function () {
        return Inertia::render('Admin/Orders/Index');
    })->name('admin.orders');
    Route::get('/order-warehouse', function () {
        return Inertia::render('Admin/Orders/IndexWarehouse');
    })->name('admin.order.warehouse');
    Route::get('/order-shipping', function () {
        return Inertia::render('Admin/Orders/IndexShipping');
    })->name('admin.order.shipping');
    Route::get('/orders/{id}', function ($id) {
        return Inertia::render('Admin/Orders/Show', ['orderId' => $id]);
    })->name('admin.orders.show');
    Route::get('/banners', function () {
        return Inertia::render('Admin/Banners/Index');
    })->name('admin.banners');
    // API Routes
    Route::prefix('purchase-orders')->group(function () {
        Route::post('/', [PurchaseOrderController::class, 'store']);
        Route::put('/{purchaseorderId}', [PurchaseOrderController::class, 'update']);
        Route::put('/{purchaseorderId}/status', [PurchaseOrderController::class, 'updateStatus']);
        Route::delete('/{purchaseorderId}', [PurchaseOrderController::class, 'destroy']);
    });
    Route::prefix('inventory-checks')->group(function () {
        Route::post('/', [InventoryCheckController::class, 'store']);
        Route::put('/{checkId}', [InventoryCheckController::class, 'update']);
        Route::put('/{checkId}/status', [InventoryCheckController::class, 'updateStatus']);
        Route::delete('/{checkId}', [InventoryCheckController::class, 'destroy']);
    });
    Route::prefix('orders')->group(function () {
        Route::put('/{orderId}', [AdminOrder::class, 'update']);
        Route::put('/{orderId}/status', [AdminOrder::class, 'updateStatus']);
        Route::put('/{orderId}/payment-status', [AdminOrder::class, 'updatePaymentStatus']);
    });
    Route::prefix('categories')->group(function () {
        Route::post('/', [CategoryController::class, 'store']);
        Route::post('/{categoryId}', [CategoryController::class, 'update']);
        Route::delete('/{categoryId}', [CategoryController::class, 'destroy']);
    });
    Route::prefix('colors')->group(function () {
        Route::post('/', [ColorController::class, 'store']);
        Route::post('/{colorId}', [ColorController::class, 'update']);
        Route::delete('/{colorId}', [ColorController::class, 'destroy']);
    });
    Route::prefix('products')->group(function () {
        Route::post('/', [ProductController::class, 'store']);
        Route::post('/{productId}', [ProductController::class, 'update']);
        Route::delete('/{productId}', [ProductController::class, 'destroy']);
    });
    Route::prefix('materials')->group(function () {
        Route::post('/', [MaterialController::class, 'store']);
        Route::post('/{materialId}', [MaterialController::class, 'update']);
        Route::delete('/{materialId}', [MaterialController::class, 'destroy']);
    });
    Route::prefix('suppliers')->group(function () {
        Route::post('/', [SupplierController::class, 'store']);
        Route::post('/{supplierId}', [SupplierController::class, 'update']);
        Route::delete('/{supplierId}', [SupplierController::class, 'destroy']);
    });
    Route::prefix('sizes')->group(function () {
        Route::post('/', [SizeController::class, 'store']);
        Route::post('/{sizeId}', [SizeController::class, 'update']);
        Route::delete('/{sizeId}', [SizeController::class, 'destroy']);
    });
    Route::prefix('tags')->group(function () {
        Route::post('/', [TagController::class, 'store']);
        Route::post('/{tagId}', [TagController::class, 'update']);
        Route::delete('/{tagId}', [TagController::class, 'destroy']);
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
        Route::post('/', [BannerController::class, 'store']);
        Route::put('/{bannerId}', [BannerController::class, 'update']);
        Route::put('/{bannerId}/toggle-status', [BannerController::class, 'toggleStatus']);
        Route::delete('/{bannerId}', [BannerController::class, 'destroy']);
    });
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::post('/', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('cart.index');
        Route::post('/add', [CartController::class, 'add'])->name('cart.add');
        Route::put('/{cartItem}', [CartController::class, 'update'])->name('cart.update');
        Route::delete('/{cartItem}', [CartController::class, 'remove'])->name('cart.remove');
        Route::delete('/', [CartController::class, 'clear'])->name('cart.clear');
    });
    Route::prefix('shipping-addresses')->group(function () {
        Route::get('/', [ShippingAddressController::class, 'index']);
        Route::post('/', [ShippingAddressController::class, 'store']);
        Route::put('/{address}', [ShippingAddressController::class, 'update']);
        Route::delete('/{address}', [ShippingAddressController::class, 'destroy']);
        Route::put('/{address}/set-default', [ShippingAddressController::class, 'setDefault']);
    });
    Route::prefix('checkout')->group(function () {
        Route::get('/', [CheckoutController::class, 'index'])->name('checkout');
        Route::post('/', [CheckoutController::class, 'store'])->name('checkout.store');
    });
    Route::prefix('order')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::get('/confirmation/{order}', [OrderController::class, 'confirmation'])->name('order.confirmation');
        Route::post('/', [OrderController::class, 'checkout'])->name('order.checkout');
        Route::get('/confirmation/{order}', [OrderController::class, 'confirmation'])->name('order.confirmation');
        Route::post('/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
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
Route::get('/products/{productId}/reviews', [ProductReviewController::class, 'getProductReviews']);
Route::get('/products/{productId}/reviews/user', [ProductReviewController::class, 'getUserReview']);

require __DIR__.'/auth.php';
