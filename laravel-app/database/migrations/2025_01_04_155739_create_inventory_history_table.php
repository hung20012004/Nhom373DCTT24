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
        Schema::create('inventory_history', function (Blueprint $table) {
            $table->id('history_id');
            $table->foreignId('product_id')->constrained('products','product_id');
            $table->foreignId('create_by')->constrained('users');
            $table->string('reference_type'); // purchase, sale, adjustment
            $table->integer('quantity_change');
            $table->string('reference_id');
            $table->integer('remaining_quantity');
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_history');
    }
};
