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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->softDeletes();
            $table->string('firstName')->nullable();
            $table->string('lastName')->nullable();
            $table->string('phone')->nullable();
            $table->json('meta')->nullable();
            $table->string('issueDate')->nullable();

            $table->json('main')->nullable();
            $table->string('tableName')->default('users');
            $table->string('elementNumber')->nullable();
            $table->string('invoiceID')->nullable();
            $table->json('invoice')->nullable();
            $table->boolean('deactivated')->default(false);
            $table->string('role')->default('user');
            $table->string('gender')->default('Male');
            $table->string('image')->nullable();
            $table->string('status')->nullable();
            $table->json('createdBy')->nullable();
            $table->json('updatedBy')->nullable();
            $table->string('name')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->json('settings')->nullable();
            $table->json('attachments')->nullable();
            $table->string('createdAt')->nullable();
            $table->string('updatedAt')->nullable();
            $table->rememberToken()->nullable();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');

    }
};
