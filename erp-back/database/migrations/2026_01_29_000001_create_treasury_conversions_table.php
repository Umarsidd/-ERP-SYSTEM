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
        Schema::create('treasury_conversions', function (Blueprint $table) {
            $table->id();
            $table->softDeletes();
            $table->string('tableName')->default('treasury_conversions');
            
            // Core conversion data
            $table->string('elementNumber')->nullable()->unique();
            $table->unsignedBigInteger('fromSafeId');
            $table->unsignedBigInteger('toSafeId');
            $table->decimal('amount', 15, 2)->default(0);
            
            // Balance tracking (before and after)
            $table->decimal('fromSafeBalanceBefore', 15, 2)->default(0);
            $table->decimal('fromSafeBalanceAfter', 15, 2)->default(0);
            $table->decimal('toSafeBalanceBefore', 15, 2)->default(0);
            $table->decimal('toSafeBalanceAfter', 15, 2)->default(0);
            
            // Conversion details
            $table->string('conversionDate')->nullable();
            $table->text('notes')->nullable();
            $table->json('attachments')->nullable();
            $table->json('main')->nullable();
            
            // Status and metadata
            $table->string('status')->default('Completed'); // Completed, Failed, Cancelled
            $table->boolean('isActive')->default(true);
            
            // Audit fields
            $table->string('createdAt')->nullable();
            $table->string('updatedAt')->nullable();
            $table->json('createdBy')->nullable();
            $table->json('updatedBy')->nullable();
            
            // Foreign key constraints
            $table->foreign('fromSafeId')->references('id')->on('bank_accounts')->onDelete('restrict');
            $table->foreign('toSafeId')->references('id')->on('bank_accounts')->onDelete('restrict');
            
            // Indexes for performance
            $table->index('fromSafeId');
            $table->index('toSafeId');
            $table->index('conversionDate');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('treasury_conversions');
    }
};
