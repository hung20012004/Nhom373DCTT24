<?php
use App\Http\Controllers\API\{
    CartController, CategoryController, ColorController, MaterialController,
    ProductController, SizeController, SupplierController, TagController
};
use App\Http\Controllers\{
    CheckoutController, ProfileController, ShippingAddressController, UserController
};
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Routes
Route::get('/', fn() => Inertia::render('Welcome', [
    'canLogin' => Route::has('login'),
    'canRegister' => Route::has('register'),
    'laravelVersion' => Application::VERSION,
    'phpVersion' => PHP_VERSION,
]))->name('home');

Route::get('/dashboard', fn() => Inertia::render('Dashboard'))
    ->middleware(['auth', 'verified', 'check.role'])->name('dashboard');

Route::get('/about', fn() => Inertia::render('About'));
Route::get('/products', fn() => Inertia::render('Products'));

// Admin Routes
Route::middleware(['auth', 'verified', 'check.role'])->prefix('admin')->group(function () {
    foreach (['customers', 'products', 'materials', 'colors', 'categories', 'staffs', 'sizes', 'tags', 'suppliers'] as $route) {
        Route::get("/$route", fn() => Inertia::render("Admin/".ucfirst($route)."/Index"))->name("admin.$route");
    }

    Route::prefix('api')->group(function () {
        foreach (['categories', 'colors', 'products', 'materials', 'suppliers', 'sizes', 'tags'] as $resource) {
            Route::apiResource($resource, ucfirst($resource).'Controller')->except(['show', 'edit', 'create']);
        }
    });

    Route::apiResource('users', UserController::class)->except(['create', 'edit']);
});

// Authenticated User Routes
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::prefix('profile')->controller(ProfileController::class)->group(function () {
        Route::get('/', 'edit')->name('profile.edit');
        Route::patch('/', 'update')->name('profile.update');
        Route::delete('/', 'destroy')->name('profile.destroy');
    });

    Route::prefix('cart')->controller(CartController::class)->group(function () {
        Route::get('/', 'index')->name('cart.index');
        Route::post('/add', 'add')->name('cart.add');
        Route::put('/{cartItem}', 'update')->name('cart.update');
        Route::delete('/{cartItem}', 'remove')->name('cart.remove');
        Route::delete('/', 'clear')->name('cart.clear');
    });

    Route::prefix('shipping-addresses')->controller(ShippingAddressController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::put('/{address}', 'update');
        Route::delete('/{address}', 'destroy');
        Route::put('/{address}/set-default', 'setDefault');
    });

    Route::prefix('checkout')->controller(CheckoutController::class)->group(function () {
        Route::get('/', 'index')->name('checkout');
        Route::post('/', 'store')->name('checkout.store');
    });
});

require __DIR__.'/auth.php';
