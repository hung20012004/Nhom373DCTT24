<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
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

            // Join with user_profiles
            $query->leftJoin('user_profiles', 'users.id', '=', 'user_profiles.user_id')
                ->addSelect([
                    'user_profiles.full_name',
                    'user_profiles.phone',
                    'user_profiles.gender',
                    'user_profiles.date_of_birth'
                ]);

            // Log the initial query
            Log::info('Initial query build complete');

            // Handle search
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('user_profiles.full_name', 'like', '%' . $search . '%')
                      ->orWhere('users.email', 'like', '%' . $search . '%')
                      ->orWhere('user_profiles.phone', 'like', '%' . $search . '%');
                });
                Log::info('Search applied', ['search' => $search]);
            }

            // Handle sorting
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

            // Get paginated results
            $perPage = $request->input('per_page', 10);

            // Log the final query
            Log::info('Query before pagination', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings()
            ]);

            $customers = $query->paginate($perPage);

            // Log the executed queries
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

            $customer = User::with(['profile', 'defaultShippingAddress'])
                ->select([
                    'users.id as user_id',
                    'users.email',
                    'users.is_active',
                    'users.last_login'
                ])
                ->leftJoin('user_profiles', 'users.id', '=', 'user_profiles.user_id')
                ->addSelect([
                    'user_profiles.full_name',
                    'user_profiles.phone',
                    'user_profiles.gender',
                    'user_profiles.date_of_birth'
                ])
                ->findOrFail($id);

            Log::info('Show customer query', [
                'queries' => DB::getQueryLog()
            ]);

            return response()->json($customer);

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
