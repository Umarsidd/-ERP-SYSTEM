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
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->softDeletes();
            // $table->timestamps();
            $table->string('tableName')->default('articles');
            $table->json('settings')->nullable();
            $table->json('attachments')->nullable();
            $table->json('main')->nullable();
            $table->json('meta')->nullable();
            $table->boolean('isActive')->default(false);
            $table->string('status')->nullable();
            $table->string('createdAt')->nullable();
            $table->string('updatedAt')->nullable();
            $table->string('createdBy')->nullable();
            $table->string('updatedBy')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
