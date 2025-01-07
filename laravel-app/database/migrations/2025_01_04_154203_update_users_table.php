<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->after('id')->constrained('roles', 'role_id');
            $table->boolean('is_active')->default(true)->after('password');
            $table->timestamp('last_login')->nullable()->after('is_active');
            $table->string('note')->nullable()->after('last_login');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn([
                'role_id',
                'is_active',
                'last_login',
                'note'
            ]);
        });
    }
};
