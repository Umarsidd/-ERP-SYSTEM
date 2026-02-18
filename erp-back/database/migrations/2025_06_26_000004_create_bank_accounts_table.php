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
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->softDeletes();
            // $table->timestamps();
            $table->string('tableName')->default('bank_accounts');
            $table->json('settings')->nullable();
            $table->json('attachments')->nullable();
            $table->json('main')->nullable();
            $table->string('elementNumber')->nullable();

            $table->float('totalAmount')->default(0);
            $table->string('issueDate')->nullable();
            $table->string('dueDate')->nullable();

            $table->string('description')->nullable();
            $table->string('deposit')->nullable();
            $table->string('depositChoice')->nullable();
            $table->string('withdraw')->nullable();
            $table->string('withdrawChoice')->nullable();
            $table->string('type')->nullable();
            $table->string('name')->nullable();
            $table->string('accountNumber')->nullable();
            $table->string('currency')->nullable();

            $table->json('meta')->nullable();
            $table->boolean('isActive')->default(false);

            $table->string('status')->nullable();
            $table->string('createdAt')->nullable();
            $table->string('updatedAt')->nullable();
            $table->json('createdBy')->nullable();
            $table->json('updatedBy')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};
