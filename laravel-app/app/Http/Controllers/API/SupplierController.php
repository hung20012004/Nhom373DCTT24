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

    public function show($id)
    {
        $supplier = Supplier::findOrFail($id);
        return new SupplierResource($supplier);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'required|string|max:500',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        DB::beginTransaction();
        try {
            // Set default is_active if not provided
            if (!isset($validated['is_active'])) {
                $validated['is_active'] = true;
            }

            $supplier = Supplier::create($validated);

            DB::commit();
            return response()->json(new SupplierResource($supplier), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error creating supplier'], 500);
        }
    }

    public function update(Request $request, $supplierId)
    {
        $rules = [
            'name' => 'string|max:255',
            'contact_name' => 'string|max:255',
            'phone' => 'string|max:20',
            'email' => 'email|max:255',
            'address' => 'string|max:500',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'is_active' => 'boolean'
        ];

        $validated = $request->validate($rules);

        DB::beginTransaction();
        try {
            $supplier = Supplier::findOrFail($supplierId);

            // Create array for update data
            $updateData = [];

            // Check and add each field to update array if present in request
            foreach ($rules as $field => $validation) {
                if ($request->has($field)) {
                    $updateData[$field] = $validated[$field];
                }
            }

            // Handle logo_url specially
            if ($request->has('logo_url')) {
                if (empty($request->logo_url)) {
                    $updateData['logo_url'] = null;
                    // Add logic to delete old logo if needed
                } else {
                    $updateData['logo_url'] = $validated['logo_url'];
                }
            }

            // Only update if there are changes
            if (!empty($updateData)) {
                $supplier->update($updateData);
            }

            DB::commit();
            return response()->json(new SupplierResource($supplier));

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating supplier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($supplierId)
    {
        DB::beginTransaction();

        try {
            $supplier = Supplier::findOrFail($supplierId);

            // Check if supplier has any purchase orders before deleting
            // if ($supplier->purchaseOrders()->exists()) {
            //     return response()->json([
            //         'message' => 'Cannot delete supplier because it has associated purchase orders'
            //     ], 400);
            // }

            $supplier->delete();

            DB::commit();
            return response()->json([
                'message' => 'Supplier deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error deleting supplier'
            ], 500);
        }
    }

    // Additional method to get active suppliers
    public function getActive()
    {
        $suppliers = Supplier::active()->orderBy('name')->get();
        return SupplierResource::collection($suppliers);
    }
}
