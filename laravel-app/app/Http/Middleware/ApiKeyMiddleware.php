<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('x-api-key');
        if (!$apiKey) {
            return response()->json([
                'status' => 'error',
                'message' => 'API key is required'
            ], 401);
        }

        $apiKey = str_replace('Bearer ', '', $apiKey);
        $user = User::where('api_key', $apiKey)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid API key'
            ], 401);
        }

        // Lưu thông tin user vào request để sử dụng trong controller nếu cần
        $request->attributes->add(['user' => $user]);

        return $next($request);
    }
}
