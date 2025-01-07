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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id('po_id');
            $table->foreignId('supplier_id')->constrained('suppliers','supplier_id');
            $table->foreignId('create_by_user_id')->constrained('users','id');
            $table->timestamp('order_date');
            $table->decimal('total_amount', 10, 2);
            $table->string('status'); // draft, ordered, received, cancelled
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
