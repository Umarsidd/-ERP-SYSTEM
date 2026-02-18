<?php

// namespace App\Http\Middleware;

// use Closure;
// use Illuminate\Http\Request;
// use Symfony\Component\HttpFoundation\Response;
// use Illuminate\Support\Facades\Config;

// class CorsMiddleware
// {////////
//     /**
//      * Handle an incoming request.
//      *
//      * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
//      */
//     public function handle(Request $request, Closure $next): Response
//     {
//         $response = $next($request);
//         $origin = $request->header('Origin');
//         $allowedOrigins = [
//             'https://dansolution.com',
//             'https://erp.dansolution.com',
//             'http://localhost:3000',
//             'http://localhost:8080',
//         ];

//         if (in_array($origin, $allowedOrigins)) {
//             $response->header('Access-Control-Allow-Origin', $origin);
//         } else {
//             $response->header('Access-Control-Allow-Origin', 'https://erp.dansolution.com');
//         }

//         $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//         $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
//         $response->header('Access-Control-Allow-Credentials', 'true');
//         $response->header('Access-Control-Expose-Headers', 'Authorization');

//         // $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:8080');
//         // $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
//         // $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//         // $response->headers->set('Access-Control-Allow-Credentials', 'true');
//         // $response->headers->set('Access-Control-Expose-Headers', 'Authorization');

//         return $response;
//     }
// }
