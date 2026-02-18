<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\TenantManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class RegisterController extends Controller
{
    protected $tenants;

    public function __construct(TenantManager $tenants)
    {
        $this->tenants = $tenants;
    }

    public function register(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255|unique:users',
            //  'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()->toArray(),
            ], 422);
        }

        // create tenant DB (sanitizes inside)
        try {
            $dbName = $this->tenants->createTenantDatabase($request->email);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create database: '.$e->getMessage()], 500);
        }

        $request->merge(['invoiceID' => $dbName]);

        $user = User::create($request->all());

        try {
            $token = JWTAuth::fromUser($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 501);
        }

        $payload = JWTAuth::manager()->getJWTProvider()->decode($token);
        $expiration = date('Y-m-d H:i:s', $payload['exp']);

        // Add tenant connection config at runtime
        $this->tenants->addTenantConnection($dbName);

        // run tenant migrations (IMPORTANT: this may take time; consider dispatching a job instead)
        try {
            $this->tenants->runTenantMigrations();
            // optionally seed
            //  $this->tenants->seedTenant();
        } catch (\Exception $e) {
            // if migrations fail, you may want to drop DB and cleanup tenant record
            // DB::statement("DROP DATABASE IF EXISTS `{$dbName}`");
            return response()->json(['error' => 'Failed to migrate tenant DB: '.$e->getMessage()], 500);
        }

        // create the initial admin user inside tenant DB
        try {

            $user2 = User::create($request->all());

            try {
                $token2 = JWTAuth::fromUser($user2);
            } catch (JWTException $e) {
                return response()->json(['error' => 'Could not create token'], 501);
            }

            $payload2 = JWTAuth::manager()->getJWTProvider()->decode($token2);
            $expiration2 = date('Y-m-d H:i:s', $payload2['exp']);

            // DB::connection('mysql')->table('users')->insert([
            //     'name' => $request->admin_name,
            //     'email' => $request->admin_email,
            //     'password' => Hash::make($request->admin_password),
            //     'created_at' => now(),
            //     'updated_at' => now(),
            // ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create tenant admin: '.$e->getMessage()], 500);
        }

        // inside your controller/seeder where you insert settings
        $path = resource_path('data/currencies.json');
        $raw = file_get_contents($path);
        $parsed = json_decode($raw, true);

        // pick the list (your file has {"currency": { "list": [...] }})
        $currencyList = $parsed['currency'];

        DB::table('setting')->insert([
            'main' => json_encode(['allowNegativeInventory' => false,
                'unitTemplates' => [[
                    'id' => 'unit_1', // .now(),
                    'baseUnit' => 'piece',
                    'name' => 'piece',
                    'conversions' => [[
                        'id' => 'conv_'.now(),
                        'unitName' => 'piece',
                        'value' => 1,
                    ]],
                    'createdAt' => now(),
                ]],
                //  'fixedCurrency' => [[]],
                'currency' => $currencyList,

            ]),
        ]);

        DB::table('bank_accounts')->insert([
            'createdAt' => now(),
            'issueDate' => now(),
            'updatedAt' => now(),
            'main' => json_encode([
                'elementNumber' => 'SAF-'.now(),
                'issueDate' => now(),
                'status' => 'Active',
                'currency' => 'IQD',
                'accountNumber' => '000000',
                'name' => 'Main',
                'type' => 'Safe',
                'description' => '',

            ]),
            'elementNumber' => 'SAF-'.now(),
            'status' => 'Active',
            'currency' => 'IQD',
            'accountNumber' => '000000',
            'name' => 'Main',
            'type' => 'Safe',
            'description' => '',

        ]);

        DB::table('accounts_guide')->insert([
            'createdAt' => now(),
            'issueDate' => now(),
            'updatedAt' => now(),
            'main' => json_encode([[
                'id' => '1',
                'code' => '1000',
                'name' => 'Main',
                'accountType' => 'main',
                'balanceType' => 'debit',
                'children' => [
                    [
                        'id' => '1.1',
                        'code' => '1100',
                        'name' => 'Cash',
                        'accountType' => 'sub',
                        'balanceType' => 'debit',
                    ],
                ],

            ]]),

            'meta' => json_encode([
                'subTree' => [
                    [
                        'id' => '1.1',
                        'code' => '1100',
                        'name' => 'Cash',
                        'accountType' => 'sub',
                        'balanceType' => 'debit',
                    ],
                ],

            ]),
        ]);

        DB::table('cost_centers')->insert([
            'createdAt' => now(),
            'issueDate' => now(),
            'updatedAt' => now(),
            'main' => json_encode([[
                'id' => '1',
                'code' => '1000',
                'name' => 'Main',
                'accountType' => 'main',
                'balanceType' => 'debit',
                'children' => [
                    [
                        'id' => '1.1',
                        'code' => '1100',
                        'name' => 'Cash',
                        'accountType' => 'sub',
                        'balanceType' => 'debit',
                    ],
                ],

            ]]),

            'meta' => json_encode([
                'subTree' => [
                    [
                        'id' => '1.1',
                        'code' => '1100',
                        'name' => 'Cash',
                        'accountType' => 'sub',
                        'balanceType' => 'debit',
                    ],
                ],

            ]),
        ]);

        return response()->json([
            'user' => $user2,
            'dumyTestData' => $dbName,
            'access_token2' => $token,
            'expires_at2' => $expiration,
            'refresh_token2' => $this->createRefreshToken($user),
            'access_token' => $token2,
            'expires_at' => $expiration2,
            'refresh_token' => $this->createRefreshToken($user2),

        ]);

    }

    public function createRefreshToken($user)
    {
        $data = [
            'user_id' => $user->id,
            'random' => bin2hex(random_bytes(40)),
            'exp' => null,
        ];

        return base64_encode(json_encode($data));
    }
}
