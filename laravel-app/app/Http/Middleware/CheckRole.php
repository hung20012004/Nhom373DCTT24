<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Add this import
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $role = null): Response
    {
        // Kiểm tra người dùng đã đăng nhập
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        // Nếu không yêu cầu role cụ thể, chỉ kiểm tra khác Customer
        if ($role === null && Auth::user()->role->name !== 'Customer') {
            return $next($request);
        }

        // Kiểm tra role cụ thể
        if ($role !== null && Auth::user()->role->name === $role) {
            return $next($request);
        }

        // Chuyển hướng nếu không có quyền
        return redirect()->route('home')->with('error', 'Bạn không có quyền truy cập trang này');
    }
}
