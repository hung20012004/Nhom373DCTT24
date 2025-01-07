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
        Schema::create('inventory_receipt_details', function (Blueprint $table) {
            $table->foreignId('receipt_id')->constrained('inventory_receipts','receipt_id' )->onDelete('cascade');
            $table->foreignId('variant_id')->constrained('product_variants','variant_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->timestamp('expiry_date')->nullable();
            $table->string('batch_number')->nullable();
            $table->primary(['receipt_id', 'variant_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_receipt_details');
    }
};
