<?php

use App\Http\Controllers\ProfileController;
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

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
Route::get('/about', function () {
    return Inertia::render('About');
});

Route::get('/products', function () {
    return Inertia::render('Products');
});

Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
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
    Route::get('/sizes', function () {
        return Inertia::render('Admin/Sizes/Index');
    })->name('admin.sizes');
    Route::get('/tags', function () {
        return Inertia::render('Admin/Tags/Index');
    })->name('admin.tags');
    Route::get('/suppliers', function () {
        return Inertia::render('Admin/Suppliers/Index');
    })->name('admin.suppliers');
});
require __DIR__.'/auth.php';
