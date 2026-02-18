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
        Schema::create('installments', function (Blueprint $table) {
            $table->id();
            $table->softDeletes();
            // $table->timestamps();
            $table->string('tableName')->default('installments');
            $table->json('settings')->nullable();
            $table->json('attachments')->nullable();
            $table->json('main')->nullable();
            $table->string('elementNumber')->nullable();

            $table->float('totalAmount')->nullable();
            $table->string('issueDate')->nullable();
            $table->string('dueDate')->nullable();
            $table->string('invoiceID')->nullable();
            $table->json('invoice')->nullable();
            $table->string('installmentAmount')->default(0);
            $table->string('installmentNumber')->default(0);
            $table->string('installmentRate')->nullable();
            $table->string('installmentAmountPaid')->default(0);
            $table->json('installmentsList')->nullable();

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
        Schema::dropIfExists('installments');
    }
};
