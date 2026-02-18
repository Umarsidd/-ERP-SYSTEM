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
        Schema::create('inventory_price_lists', function (Blueprint $table) {
            $table->id();
            $table->softDeletes();
            // $table->timestamps();
            $table->string('tableName')->default('inventory_price_lists');
            $table->json('settings')->nullable();
            $table->json('attachments')->nullable();
            $table->json('items')->nullable();
            $table->string('elementNumber')->nullable();
            $table->string('issueDate')->nullable();
            $table->string('name')->nullable();
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
        Schema::dropIfExists('inventory_price_lists');
    }
};
