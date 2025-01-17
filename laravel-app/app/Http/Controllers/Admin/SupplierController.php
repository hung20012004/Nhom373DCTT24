<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Material;
use App\Models\Color;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Supplier::query();

            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%")
                      ->orWhere('contact_name', 'like', "%{$searchTerm}%")
                      ->orWhere('email', 'like', "%{$searchTerm}%");
                });
            }

            $sortField = $request->input('sort_field', 'created_at');
            $sortDirection = $request->input('sort_direction', 'desc');
            $allowedSortFields = ['name', 'contact_name', 'email', 'created_at'];

            if (in_array($sortField, $allowedSortFields)) {
                $query->orderBy($sortField, $sortDirection);
            }

            $perPage = $request->input('per_page', 10);
            $suppliers = $query->paginate($perPage);

            return [
                'data' => $suppliers,
                'current_page' => $suppliers->currentPage(),
                'per_page' => $suppliers->perPage(),
                'last_page' => $suppliers->lastPage(),
                'total' => $suppliers->total()
            ];
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching suppliers'], 500);
        }
    }
}
