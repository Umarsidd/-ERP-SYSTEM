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
        Schema::create('user_statement', function (Blueprint $table) {
            $table->id();
            $table->softDeletes();
            // $table->timestamps();
            $table->string('tableName')->default('user_statement');
            $table->json('attachments')->nullable();
            $table->json('main')->nullable();
            $table->string('elementNumber')->nullable();
            $table->json('meta')->nullable();
            $table->boolean('isActive')->default(false);
            // $table->boolean('allowNegativeInventory')->default(false);
            $table->string('status')->nullable();
            $table->string('createdAt')->nullable();
            $table->string('updatedAt')->nullable();
            $table->json('createdBy')->nullable();
            $table->json('updatedBy')->nullable();

            $table->string('firstName')->nullable();
            $table->string('lastName')->nullable();
            $table->string('phone')->nullable();
            $table->string('issueDate')->nullable();
            $table->string('invoiceID')->nullable();
            $table->json('invoice')->nullable();
            $table->boolean('deactivated')->default(false);
            $table->string('role')->default('user');
            $table->string('gender')->default('Male');
            $table->string('image')->nullable();
            $table->string('name')->nullable();
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_statement');
    }
};
