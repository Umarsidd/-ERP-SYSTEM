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
        Schema::create('schedule', function (Blueprint $table) {
            $table->id();
            $table->softDeletes();

            $table->json('settings')->nullable();
            $table->json('attachments')->nullable();
            $table->json('main')->nullable();
            $table->string('elementNumber')->nullable();

            $table->json('schedule')->nullable();
            $table->json('teachers')->nullable();
            $table->json('classes')->nullable();
            $table->json('periods')->nullable();
            $table->string('userId')->nullable();

            $table->json('meta')->nullable();
            $table->boolean('isActive')->default(false);
            $table->string('tableName')->default('schedule');
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
        Schema::dropIfExists('schedule');
    }
};
