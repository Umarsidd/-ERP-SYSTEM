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
        Schema::create('sales_invoices', function (Blueprint $table) {
            $table->id();
            $table->softDeletes();
            // $table->timestamps();
            // $table->uuid('uuid')->primary();
            // $table->string('sku')->primary();
            // $table->json('note')->nullable();
            // $table->json('quote_management')->nullable();
            // $table->json('create_a_quote')->nullable();
            // $table->json('credit_notices')->nullable();
            // $table->json('returned_invoices')->nullable();
            // $table->json('recurring_bills')->nullable();
            // $table->json('customer_payments')->nullable();
            // $table->json('options')->nullable(); ///
            // $table->boolean('alreadyPaid')->default(false);

            //   $table->string('installmentsId')->nullable();

            //   $table->json('installments')->nullable();
            //         $table->json('activeHistory')->nullable();
            //               $table->json('paymentHistory')->nullable();
            //                     $table->json('inventoryHistory')->nullable();

            $table->json('settings')->nullable();
            $table->json('attachments')->nullable();
            $table->json('main')->nullable();
            $table->string('elementNumber')->nullable();
            $table->float('totalAmount')->nullable();
            $table->string('issueDate')->nullable();
            $table->string('dueDate')->nullable();
            $table->string('paymentMethod')->nullable();
            $table->json('meta')->nullable();
            $table->boolean('isActive')->default(false);
            $table->string('tableName')->default('sales_invoices');
            $table->string('status')->nullable();
            $table->string('stockStatus')->default('stockPending');

            $table->string('returnStatus')->nullable();
            $table->string('returnAmount')->nullable();

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
        Schema::dropIfExists('sales_invoices');
    }
};
