<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://dansolution.com',
        'https://erp.dansolution.com',
        'https://school.dansolution.com',

        'https://dan-erp.com',
        'https://dev.dan-erp.com',
        'https://tube.dan-erp.com',
        'https://sajjad.dan-erp.com',
        'https://v1.dan-erp.com',

        'http://127.0.0.1:8080',

        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:8081',

    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['Authorization'],
    'max_age' => 0,
    'supports_credentials' => true, // تأكد من أن هذه القيمة true
];
