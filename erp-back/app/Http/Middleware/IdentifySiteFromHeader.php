<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class IdentifySiteFromHeader
{
    public function handle(Request $request, Closure $next): Response
    {

        $clientId = $request->header('x-client');
        Config::set('database.connections.mysql.database', $clientId);
        DB::purge('mysql');
        DB::reconnect('mysql');
        $request->attributes->set('client_id', $clientId);

        // $client = $request->header('x-client');
        //         $connection = match($client) {
        //     'c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4' => 'dan',
        //     'e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6' => 'erp',
        //     'site2' => 'mysql_site2',
        //     default => 'mysql'
        // };

        // Config::set('database.default', $connection);
        // Config::set('app.current_client', $client);
        // \Log::info("Client detected: {$client}, Using connection: {$connection}");

        return $next($request);
    }
}

// c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4 used dan
// e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6 used erp
// a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8
// c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0
// e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2
// a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4
// c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6
// e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8
// a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0
// c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2
// e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4
// a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6
// c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8
// e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0
// a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2
