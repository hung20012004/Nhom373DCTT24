<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVariantImagesTable extends Migration
{
    public function up()
    {
        Schema::create('variant_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('variant_id');
            $table->string('image_url');
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->foreign('variant_id')
                  ->references('variant_id')
                  ->on('product_variants')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('variant_images');
    }
}
