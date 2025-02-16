<?php

namespace App\Http\Controllers;

use App\Models\ShippingAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShippingAddressController extends Controller
{
    /**
     * Lấy danh sách địa chỉ của user hiện tại
     */
    public function index()
    {
        $addresses = ShippingAddress::where('user_id', Auth::id())
            ->orderBy('is_default', 'desc')
            ->get();

        return response()->json($addresses);
    }

    /**
     * Tạo địa chỉ mới
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'province' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'ward' => 'required|string|max:255',
            'street_address' => 'required|string|max:255',
            'is_default' => 'boolean'
        ]);

        // Nếu đây là địa chỉ mặc định, bỏ mặc định của các địa chỉ khác
        if ($validated['is_default']) {
            ShippingAddress::where('user_id', Auth::id())
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        // Nếu đây là địa chỉ đầu tiên, tự động đặt làm mặc định
        $hasAddresses = ShippingAddress::where('user_id', Auth::id())->exists();
        if (!$hasAddresses) {
            $validated['is_default'] = true;
        }

        $address = ShippingAddress::create([
            'user_id' => Auth::id(),
            ...$validated
        ]);

        return response()->json($address, 201);
    }

    /**
     * Cập nhật địa chỉ
     */
    public function update(Request $request, ShippingAddress $address)
    {
        // Kiểm tra quyền sở hữu
        if ($address->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'province' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'ward' => 'required|string|max:255',
            'street_address' => 'required|string|max:255',
            'is_default' => 'boolean'
        ]);

        // Nếu đặt làm địa chỉ mặc định
        if ($validated['is_default']) {
            ShippingAddress::where('user_id', Auth::id())
                ->where('is_default', true)
                ->where('id', '!=', $address->id)
                ->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json($address);
    }

    /**
     * Xóa địa chỉ
     */
    public function destroy(ShippingAddress $address)
    {
        // Kiểm tra quyền sở hữu
        if ($address->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Nếu xóa địa chỉ mặc định và còn địa chỉ khác
        if ($address->is_default) {
            $newDefault = ShippingAddress::where('user_id', Auth::id())
                ->where('id', '!=', $address->id)
                ->first();

            if ($newDefault) {
                $newDefault->update(['is_default' => true]);
            }
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted successfully']);
    }

    /**
     * Đặt địa chỉ làm mặc định
     */
    public function setDefault(ShippingAddress $address)
    {
        // Kiểm tra quyền sở hữu
        if ($address->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Bỏ mặc định của các địa chỉ khác
        ShippingAddress::where('user_id', Auth::id())
            ->where('is_default', true)
            ->update(['is_default' => false]);

        // Đặt địa chỉ này làm mặc định
        $address->update(['is_default' => true]);

        return response()->json($address);
    }
}
