<?php

/**
 * Config de CORS pras rotas api/* — necessária pro frontend novo (React,
 * hospedado em domínio diferente do backend) poder chamar a API do
 * browser. O middleware Illuminate\Http\Middleware\HandleCors já vem
 * habilitado por padrão no stack global do Laravel 11+ (bootstrap/app.php
 * não precisa registrar nada) — sem este arquivo, `paths` fica vazio e
 * ele não age em rota nenhuma, que era o estado anterior (CORS de fato
 * desligado).
 *
 * `supports_credentials` fica false porque a API é stateless (JWT via
 * header Authorization, não cookie de sessão) — não há CSRF a proteger
 * aqui, então liberar origins com `*` é seguro mesmo com credentials
 * desligado. Se no futuro precisar restringir a domínios específicos
 * (ex. só o domínio do frontend do Paulo), defina CORS_ALLOWED_ORIGINS
 * no .env como lista separada por vírgula.
 */
return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', '*'))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
