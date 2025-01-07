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
        Schema::create('promotions', function (Blueprint $table) {
            $table->id('promotion_id');
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('discount_type');
            $table->decimal('discount_value', 10, 2);
            $table->decimal('min_order_value', 10, 2)->nullable();
            $table->decimal('max_discount', 10, 2)->nullable();
            $table->timestamp('start_date');
            $table->timestamp('end_date')->nullable();  // Thêm nullable()
            $table->integer('usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
