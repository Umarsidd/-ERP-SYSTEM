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
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->softDeletes();
            // $table->timestamps();
            $table->string('tableName')->default('branches');
            $table->json('attachments')->nullable();
                        $table->string('name')->nullable();
            $table->string('email')->nullable();
                        $table->string('phone')->nullable();
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
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
