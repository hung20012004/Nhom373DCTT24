<?php
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ShippingAddressController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\ColorController;
use App\Http\Controllers\API\MaterialController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\SizeController;
use App\Http\Controllers\API\SupplierController;
use App\Http\Controllers\API\TagController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
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
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/about', function () {
    return Inertia::render('About');
});
Route::get('/products', function () {
    return Inertia::render('Products');
});

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
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
    // API Routes
    Route::prefix('api')->group(function () {
        // Categories
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::post('/categories/{categoryId}', [CategoryController::class, 'update']);
        Route::delete('/categories/{categoryId}', [CategoryController::class, 'destroy']);
        // Colors
        Route::post('/colors', [ColorController::class, 'store']);
        Route::post('/colors/{colorId}', [ColorController::class, 'update']);
        Route::delete('/colors/{colorId}', [ColorController::class, 'destroy']);
        // Products
        Route::post('/products', [ProductController::class, 'store']);
        Route::post('/products/{productId}', [ProductController::class, 'update']);
        Route::delete('/products/{productId}', [ProductController::class, 'destroy']);

        // Materials
        Route::post('/materials', [MaterialController::class, 'store']);
        Route::post('/materials/{materialId}', [MaterialController::class, 'update']);
        Route::delete('/materials/{materialId}', [MaterialController::class, 'destroy']);
        // Suppliers
        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::post('/suppliers', [SupplierController::class, 'store']);
        Route::post('/suppliers/{supplierId}', [SupplierController::class, 'update']);
        Route::delete('/suppliers/{supplierId}', [SupplierController::class, 'destroy']);
        // Sizes
        Route::get('/sizes', [SizeController::class, 'index']);
        Route::post('/sizes', [SizeController::class, 'store']);
        Route::post('/sizes/{sizeId}', [SizeController::class, 'update']);
        Route::delete('/sizes/{sizeId}', [SizeController::class, 'destroy']);
        // Tags
        Route::get('/tags', [TagController::class, 'index']);
        Route::post('/tags', [TagController::class, 'store']);
        Route::post('/tags/{tagId}', [TagController::class, 'update']);
        Route::delete('/tags/{tagId}', [TagController::class, 'destroy']);
    });
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::post('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('profile.update');
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
});
require __DIR__.'/auth.php';
