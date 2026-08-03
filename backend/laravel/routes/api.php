<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ComunidadeController;
use App\Http\Controllers\Api\EventoController;
use Illuminate\Support\Facades\Route;

// Espelha core/api.py (Django), construído com django-ninja. Aqui o
// equivalente é um conjunto de controllers REST "finos" por recurso.

Route::post('/auth/token', [AuthController::class, 'obterToken']);

Route::get('/comunidades', [ComunidadeController::class, 'index']);
Route::get('/comunidades/{comunidade}', [ComunidadeController::class, 'show']);
Route::get('/comunidades/{comunidade}/eventos', [ComunidadeController::class, 'eventos']);
Route::middleware('auth:api')->group(function () {
    Route::post('/comunidades', [ComunidadeController::class, 'store']);
    Route::put('/comunidades/{comunidade}', [ComunidadeController::class, 'update']);
    Route::delete('/comunidades/{comunidade}', [ComunidadeController::class, 'destroy']);
});

Route::get('/eventos', [EventoController::class, 'index']);
Route::get('/eventos/{evento}', [EventoController::class, 'show']);
Route::middleware('auth:api')->group(function () {
    Route::post('/eventos', [EventoController::class, 'store']);
    Route::put('/eventos/{evento}', [EventoController::class, 'update']);
    Route::delete('/eventos/{evento}', [EventoController::class, 'destroy']);
});
