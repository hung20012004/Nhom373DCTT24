<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    // Trong App\Http\Controllers\Admin\CustomerController.php
    public function index(Request $request)
    {
        try {
            // Enable query logging for debugging
            DB::enableQueryLog();

            $query = User::query()
                ->with(['profile', 'defaultShippingAddress'])
                ->select([
                    'users.id as user_id',
                    'users.email',
                    'users.is_active',
                    'users.last_login',
                    'users.created_at'
                ]);

            // Join với user_profiles
            $query->leftJoin('user_profiles', 'users.id', '=', 'user_profiles.user_id')
                ->addSelect([
                    'user_profiles.full_name',
                    'user_profiles.phone',
                    'user_profiles.gender',
                    'user_profiles.date_of_birth'
                ]);

            // Join với bảng roles và lọc theo role customer
            $query->join('roles', 'users.role_id', '=', 'roles.role_id')
                ->where('roles.name', '=', 'customer');

            // Log the initial query
            Log::info('Initial query build complete');

            // Phần code xử lý tìm kiếm và sắp xếp giữ nguyên
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('user_profiles.full_name', 'like', '%' . $search . '%')
                        ->orWhere('users.email', 'like', '%' . $search . '%')
                        ->orWhere('user_profiles.phone', 'like', '%' . $search . '%');
                });
                Log::info('Search applied', ['search' => $search]);
            }

            // Phần code xử lý sắp xếp giữ nguyên
            $sortField = $request->input('sort_field', 'full_name');
            $sortDirection = $request->input('sort_direction', 'asc');

            $fieldMapping = [
                'full_name' => 'user_profiles.full_name',
                'email' => 'users.email',
                'phone' => 'user_profiles.phone',
                'created_at' => 'users.created_at'
            ];

            if (array_key_exists($sortField, $fieldMapping)) {
                $query->orderBy($fieldMapping[$sortField], $sortDirection);
                Log::info('Sort applied', [
                    'field' => $fieldMapping[$sortField],
                    'direction' => $sortDirection
                ]);
            }

            // Phần code xử lý phân trang giữ nguyên
            $perPage = $request->input('per_page', 10);

            Log::info('Query before pagination', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings()
            ]);

            $customers = $query->paginate($perPage);

            Log::info('Executed queries', [
                'queries' => DB::getQueryLog()
            ]);

            return response()->json($customers);

        } catch (\Exception $e) {
            Log::error('Error in CustomerController@index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'message' => 'Error fetching customers',
                'error' => $e->getMessage(),
                'debug_info' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ], 500);
        }
    }
    public function show($id)
{
    try {
        DB::enableQueryLog();

        // First find the user with the customer role
        $user = User::where('id', $id)
            ->join('roles', 'users.role_id', '=', 'roles.role_id')
            ->where('roles.name', '=', 'customer')
            ->firstOrFail();

        // Then load the user with all required relationships
        $customer = User::where('id', $user->id)
            ->with([
                'profile',
                'shippingAddresses' => function($query) {
                    $query->where('is_default', true);
                },
                'orders' => function ($query) {
                    $query->latest()->limit(5);
                }
            ])
            ->first();

        // Transform the data to match the frontend expectations
        $customerData = $customer->toArray();

        // Add fields from profile
        if ($customer->profile) {
            $customerData['full_name'] = $customer->profile->full_name ?? null;
            $customerData['phone'] = $customer->profile->phone ?? null;
            $customerData['gender'] = $customer->profile->gender ?? null;
            $customerData['date_of_birth'] = $customer->profile->date_of_birth ?? null;
        }

        // Set user_id explicitly
        $customerData['user_id'] = $customer->id;

        // Handle the default shipping address
        $customerData['defaultShippingAddress'] = !empty($customer->shippingAddresses)
            ? $customer->shippingAddresses[0]
            : null;

        Log::info('Show customer data prepared:', [
            'has_profile' => isset($customer->profile),
            'has_address' => !empty($customerData['defaultShippingAddress']),
            'orders_count' => count($customerData['orders'] ?? [])
        ]);

        return response()->json($customerData);

    } catch (\Exception $e) {
        Log::error('Error in CustomerController@show', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'customer_id' => $id
        ]);

        return response()->json([
            'message' => 'Error fetching customer details',
            'error' => $e->getMessage(),
            'debug_info' => [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]
        ], 500);
    }
}
}

