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
        Schema::create('inventory_products', function (Blueprint $table) {
            $table->id();
            $table->softDeletes();
            // $table->timestamps();
            $table->string('tableName')->default('inventory_products');
            $table->json('settings')->nullable();
            $table->json('attachments')->nullable();
            $table->json('main')->nullable();

            $table->integer('stockQuantity')->default(0);
            $table->integer('oldQuantity')->default(0);
            $table->string('elementNumber')->nullable();
            $table->float('totalAmount')->nullable();
            $table->string('issueDate')->nullable();
            $table->string('sku')->nullable();
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
        Schema::dropIfExists('inventory_products');
    }
};
