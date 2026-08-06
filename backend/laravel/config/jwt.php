<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Segredo de assinatura do JWT
    |--------------------------------------------------------------------------
    |
    | Reaproveita APP_KEY como padrão se JWT_SECRET não estiver definido —
    | evita exigir mais uma variável de ambiente pra rodar localmente
    | (APP_KEY já é gerado por `php artisan key:generate` em todo setup
    | novo). Defina JWT_SECRET explicitamente em produção se quiser
    | rotacionar as chaves de forma independente.
    |
    */
    'secret' => env('JWT_SECRET', env('APP_KEY')),

    /*
    |--------------------------------------------------------------------------
    | Tempo de vida do token (minutos)
    |--------------------------------------------------------------------------
    */
    'ttl' => (int) env('JWT_TTL', 60),

    /*
    |--------------------------------------------------------------------------
    | Algoritmo de assinatura
    |--------------------------------------------------------------------------
    */
    'algo' => 'HS256',

];
