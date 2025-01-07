<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id('order_id');
            $table->foreignId('user_id')->constrained('users','id');
            $table->foreignId('shipping_address_id')->constrained('shipping_addresses','address_id');
            $table->foreignId('promotion_id')->nullable()->constrained('promotions','promotion_id');
            $table->timestamp('order_date');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('shipping_fee', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->string('payment_method');
            $table->string('payment_status');
            $table->string('order_status');
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
