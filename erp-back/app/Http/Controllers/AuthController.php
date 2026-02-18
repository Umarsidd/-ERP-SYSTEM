<?php

namespace App\Http\Controllers;

use App\Mail\PasswordResetMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUser(Request $request)
    {
        try {

            //    $user = User::findOrFail($request->id);
            $users = User::orderBy('id', 'desc')->paginate(1);

            return response()->json(['users' => $users]);

        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to fetch user profile'], 500);
        }
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

        $user = User::create($request->all());

        try {
            $token = JWTAuth::fromUser($user);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 501);
        }

        $payload = JWTAuth::manager()->getJWTProvider()->decode($token);
        $expiration = date('Y-m-d H:i:s', $payload['exp']);

        return response()->json([
            'access_token' => $token,
            'user' => $user,
            'expires_at' => $expiration,
            'refresh_token' => $this->createRefreshToken($user),

        ]);

    }

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {

        $credentials = $request->only(['email', 'password']);

        try {
            if (! $token = JWTAuth::attempt($credentials)) {
                return response()->json(['error' => 'Invalid credentials'], 402);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token'], 500);
        }

        $payload = JWTAuth::manager()->getJWTProvider()->decode($token);
        $expiration = date('Y-m-d H:i:s', $payload['exp']);

        return response()->json([
            'access_token' => $token,
            'user' => auth()->user(),
            'expires_at' => $expiration,
            'refresh_token' => $this->createRefreshToken(auth()->user()),

        ]);

    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $user->update($request->all());

        return response()->json([
            'message' => 'تم التحديث الجزئي للمستخدم بنجاح',
            'user' => $user,
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()->toArray(),
            ], 422);
        }
        $user = User::where('email', $request->email)->first();
        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        $token = Str::random(60);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );
        Mail::to($user->email)->send(new PasswordResetMail($token));

        return response()->json(['message' => 'Password reset link sent']);
    }

    /**
     * تعيين كلمة مرور جديدة
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email',
            // 'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()->toArray(),
            ], 422);
        }
        $reset = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();
        if (! $reset || ! Hash::check($request->token, $reset->token)) {
            return response()->json(['message' => 'Invalid token'], 400);
        }
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password reset successfully']);
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

    public function refreshToken(Request $request)
    {
        try {

            $token = $request->token;  // $request->bearerToken();
            $decoded = json_decode(base64_decode($token));
            if ($decoded == null) {
                return response()->json(['error' => 'User not found'], 422);
            }
            $user = User::find($decoded->user_id);
            try {
                $newtoken = JWTAuth::fromUser($user);
            } catch (JWTException $e) {
                return response()->json(['error' => 'Could not create token'], 500);
            }
            $payload = JWTAuth::manager()->getJWTProvider()->decode($newtoken);
            $expiration = date('Y-m-d g:i a', $payload['exp']);

            // H:i:s
            return response()->json(['expires_at' => $expiration, 'access_token' => $newtoken, // 'payload'=> $payload
            ]);
        } catch (\Exception $e) {
            return false;
        }
    }
}

/**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
// public function me()
// {
//     return response()->json(auth()->user());

//     //  return response()->json(JWTAuth::user());
// }

//     public function adminlogin(Request $request)
// {

//     $credentials = $request->only(['email', 'password']);

//     try {
//         if (! $token = JWTAuth::attempt($credentials)) {
//             return response()->json(['error' => 'Invalid credentials'], 401);
//         }
//     } catch (JWTException $e) {
//         return response()->json(['error' => 'Could not create token'], 500);
//     }

//     $payload = JWTAuth::manager()->getJWTProvider()->decode($token);
//     $expiration = date('Y-m-d H:i:s', $payload['exp']);

//     return response()->json([
//         'access_token' => $token,
//         'user' => auth()->user(),
//         'expires_at' => $expiration,
//         'refresh_token' => $this->createRefreshToken(auth()->user()),

//     ]);

// }

/**
 * Log the user out (Invalidate the token).
 *
 * @return \Illuminate\Http\JsonResponse
 */
// public function logout()
// {

//     auth()->logout();

//     // try {
//     //     JWTAuth::invalidate(JWTAuth::getToken());
//     // } catch (JWTException $e) {
//     //     return response()->json(['error' => 'Failed to logout, please try again'], 500);
//     // }

//     return response()->json(['message' => 'Successfully logged out']);
// }

// public function delete(Request $request)
// {
//     $user = User::findOrFail($request->id);

//     $user->delete();

//     // إرجاع الرد
//     return response()->json([
//         'message' => 'deleted',

//     ]);

// }

// public function getAllUser(Request $request)
// {
//     try {

//         //    $user = User::findOrFail($request->id);
//         $users = User::paginate(1);

//         return response()->json(['users' => $users]);

//     } catch (JWTException $e) {
//         return response()->json(['error' => 'Failed to fetch user profile'], 500);
//     }
// }

// public function getUserById(Request $request)
// {
//     try {

//         //  return response()->json(['error' => $request], 404);
//         //    $request->validate([
//         //         'id' => 'required|integer|exists:users,id'
//         //     ]);

//         $user = User::findOrFail($request->id);
//         if (! $user) {
//             return response()->json(['error' => 'User not found'], 404);
//         }

//         return response()->json(['user' => $user]);

//     } catch (JWTException $e) {
//         return response()->json(['error' => 'Failed to fetch user profile'], 500);
//     }
// }

// public function getMyUser(Request $request)
// {
//     try {

//         $token = $request->bearerToken();

//         //   $decoded = json_decode(base64_decode($token));
//         $payload = JWTAuth::manager()->getJWTProvider()->decode($token);

//         $user = User::find($payload['user_id']);
//         if (! $user) {
//             return response()->json(['error' => 'User not found'], 404);
//         }

//         return response()->json(['user' => $user]);

//     } catch (JWTException $e) {
//         return response()->json(['error' => 'Failed to fetch user profile'], 500);
//     }
// }

// $user = User::create([
//     'name' => $request->name,
//     'email' => $request->email,
//     'password' => Hash::make($request->password),

//     'firstName' => $request->firstName,
//     'lastName' => $request->lastName,
//     'phone' => $request->phone,
//     'role' => $request->role,
//     'gender' => $request->gender,
//     'image' => $request->image,
// //    'passwordConfirmation' => Hash::make($request->passwordConfirmation),

//     'emailConfirmation' => $request->emailConfirmation,
//     'deactivated' => $request->deactivated,
//     'meta' => $request->meta,

// ]);
//
