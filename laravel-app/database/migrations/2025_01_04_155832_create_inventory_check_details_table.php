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
        Schema::create('inventory_check_details', function (Blueprint $table) {
            $table->foreignId('check_id')->constrained('inventory_checks','check_id')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products','product_id');
            $table->integer('system_quantity');
            $table->integer('actual_quantity');
            $table->integer('difference');
            $table->text('note')->nullable();
            $table->primary(['check_id', 'product_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_check_details');
    }
};
