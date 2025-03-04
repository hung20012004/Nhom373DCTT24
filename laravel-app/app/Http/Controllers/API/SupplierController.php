<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query()
            ->select('suppliers.*');

        if ($request->filled('search')) {
            $query->search($request->search); // Using the scope from the model
        }

        // Handle sorting
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        $allowedSortFields = [
            'name' => 'name',
            'email' => 'email',
            'contact_name' => 'contact_name',
            'created_at' => 'created_at'
        ];

        if (array_key_exists($sortField, $allowedSortFields)) {
            $dbField = $allowedSortFields[$sortField];
            $query->orderBy($dbField, $sortDirection);
        }

        // Handle pagination
        $perPage = $request->input('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50, 100]) ? $perPage : 10;

        $suppliers = $query->paginate($perPage);

        return [
            'data' => SupplierResource::collection($suppliers),
            'current_page' => $suppliers->currentPage(),
            'per_page' => $suppliers->perPage(),
            'last_page' => $suppliers->lastPage(),
            'total' => $suppliers->total(),
            'sort' => [
                'field' => $sortField,
                'direction' => $sortDirection
            ]
        ];
    }
    public function getActive()
    {
        $suppliers = Supplier::active()->orderBy('name')->get();
        return SupplierResource::collection($suppliers);
    }
}
