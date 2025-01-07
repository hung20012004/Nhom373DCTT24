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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id('variant_id');
            $table->foreignId('product_id')->constrained('products','product_id')->onDelete('cascade');
            $table->foreignId('size_id')->constrained('sizes','size_id');
            $table->foreignId('color_id')->constrained('colors','color_id');
            $table->string('sku')->unique();
            $table->integer('stock_quantity')->default(0);
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products_variants');
    }
};
