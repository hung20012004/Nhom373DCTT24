<?php
namespace App\Http\Controllers\Customer;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
class CheckoutController extends Controller
{
    public function index()
    {
        return Inertia::render('Checkout');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fullName' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'address' => 'required',
            'city' => 'required',
            'district' => 'required',
            'ward' => 'required',
            'paymentMethod' => 'required|in:cod,banking',
            'items' => 'required|array'
        ]);

        // Xử lý tạo đơn hàng
        // Tạo hóa đơn
        // Xử lý thanh toán

        return redirect()->route('thank-you');
    }
}
