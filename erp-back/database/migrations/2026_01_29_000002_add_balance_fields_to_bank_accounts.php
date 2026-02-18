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
        Schema::table('bank_accounts', function (Blueprint $table) {
            // Add balance tracking fields
            $table->decimal('currentBalance', 15, 2)->default(0)->after('currency');
            $table->decimal('openingBalance', 15, 2)->default(0)->after('currentBalance');
            
            // Add index on status for faster queries
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn(['currentBalance', 'openingBalance']);
        });
    }
};
