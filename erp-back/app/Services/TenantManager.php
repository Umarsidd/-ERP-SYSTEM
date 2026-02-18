<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class TenantManager
{
    /**
     * Create a database for the tenant (MySQL example).
     *
     * @param  string  $rawName  used to build DB name (will be sanitized)
     * @return string $dbName created database name
     *
     * @throws \Exception
     */
    public function createTenantDatabase(string $rawName): string
    {
        // sanitize and build db name
        $prefix = env('TENANT_DB_PREFIX', 'tenant_');
        $safe = preg_replace('/[^a-z0-9_]/', '_', strtolower($rawName));
        $dbName = $prefix.$safe.'_'.substr(md5(uniqid('', true)), 0, 8);

        // get default connection config (assume mysql)
        $connection = config('database.default');
        $default = config("database.connections.{$connection}");

        if (! $default) {
            throw new Exception('Default DB connection not found.');
        }

        // create database (ensure your DB user can CREATE DATABASE)
        $charset = $default['charset'] ?? 'utf8mb4';
        $collation = $default['collation'] ?? 'utf8mb4_unicode_ci';
        // use the default connection (which points to server) to issue CREATE DATABASE
        DB::statement("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET {$charset} COLLATE {$collation}");

        return $dbName;
    }

    /**
     * Add a runtime connection config for this tenant
     */
    public function addTenantConnection(string $dbName, ?string $username = null, ?string $password = null)
    {
        $connection = config('database.default');
        $default = config("database.connections.{$connection}");

        $tenantConfig = $default;
        $tenantConfig['database'] = $dbName;
        if ($username !== null) {
            $tenantConfig['username'] = $username;
        }
        if ($password !== null) {
            $tenantConfig['password'] = $password;
        }

        // set tenant connection name to 'tenant'
        Config::set('database.connections.mysql', $tenantConfig);

        // ensure no cached connection
        DB::purge('mysql');
    }

    /**
     * Run tenant migrations
     */
    public function runTenantMigrations(): void
    {
        // Make sure migrations for tenants are in database/migrations/tenant or run the same migrations
        // Here we call Artisan migrate with --database=tenant; adjust --path if you keep tenant migrations separate.
        Artisan::call('migrate', [
            '--database' => 'mysql',
            '--path' => '/database/migrations',
            '--force' => true,
        ]);
    }

    /**
     * Optionally seed tenant DB
     */
    public function seedTenant(?string $seeder = null): void
    {
        $params = [
            '--database' => 'mysql',
            '--force' => true,
        ];
        if ($seeder) {
            $params['--class'] = $seeder;
        }
        Artisan::call('db:seed', $params);
    }
}
