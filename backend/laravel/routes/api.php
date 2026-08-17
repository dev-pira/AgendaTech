<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CalendarioController;
use App\Http\Controllers\Api\ComunidadeController;
use App\Http\Controllers\Api\DeployController;
use App\Http\Controllers\Api\EventoController;
use App\Http\Controllers\Api\MembroController;
use Illuminate\Support\Facades\Route;

// Espelha core/api.py (Django), construído com django-ninja. Aqui o
// equivalente é um conjunto de controllers REST "finos" por recurso.

// Issue #76: sem throttle, dava pra tentar senha infinitas vezes.
Route::post('/auth/token', [AuthController::class, 'obterToken'])->middleware('throttle:5,1');

// Issue #73: antes so existia via view Blade (App\Http\Controllers\
// AuthController::cadastro) - o frontend React nao tinha como se
// cadastrar sozinho. Mesmo throttle do login (endpoint publico de
// escrita, mesmo risco de abuso).
Route::post('/cadastro', [AuthController::class, 'cadastro'])->middleware('throttle:5,1');

// Gatilho de deploy via HTTP (substitui SSH no GitHub Actions - ver
// docs/deploy.md). Autenticado por segredo compartilhado (X-Deploy-Secret),
// nao por auth:api - throttle so pra limitar tentativa de forca bruta
// no segredo, nao impede deploy legitimo em uso normal.
Route::post('/internal/deploy', [DeployController::class, 'trigger'])->middleware('throttle:10,1');

Route::get('/comunidades', [ComunidadeController::class, 'index']);
Route::get('/comunidades/{comunidade}', [ComunidadeController::class, 'show']);
Route::get('/comunidades/{comunidade}/eventos', [ComunidadeController::class, 'eventos']);
// Issue #83: rotas de escrita autenticadas nao tinham nenhum rate limit -
// um usuario autenticado (ou conta comprometida) podia automatizar
// centenas de requisicoes/segundo sem freio nenhum. throttle:60,1 e
// generoso o suficiente pra uso legitimo (1/seg em media) mas barra
// automacao abusiva - defesa em profundidade, nao trava fluxo normal.
Route::middleware(['auth:api', 'throttle:60,1'])->group(function () {
    Route::post('/comunidades', [ComunidadeController::class, 'store']);
    Route::put('/comunidades/{comunidade}', [ComunidadeController::class, 'update']);
    Route::delete('/comunidades/{comunidade}', [ComunidadeController::class, 'destroy']);

    // Gestão de membros/organizadores — issue #53 (porte do Node, nunca
    // migrado junto com o resto da API na troca de stack).
    Route::get('/comunidades/{comunidade}/membros', [MembroController::class, 'index']);
    Route::post('/comunidades/{comunidade}/membros', [MembroController::class, 'store']);
    Route::patch('/comunidades/{comunidade}/membros/{usuarioId}/papel', [MembroController::class, 'updatePapel']);
    Route::delete('/comunidades/{comunidade}/membros/{usuarioId}', [MembroController::class, 'destroy']);
});

Route::get('/eventos', [EventoController::class, 'index']);
Route::get('/eventos/{evento}', [EventoController::class, 'show']);

// Endpoint agregador pra tela de calendário compartilhado (DevItape) —
// issue #54 (porte do Node, nunca migrado junto com o resto da API).
Route::get('/calendario', [CalendarioController::class, 'index']);
Route::middleware(['auth:api', 'throttle:60,1'])->group(function () {
    Route::post('/eventos', [EventoController::class, 'store']);
    Route::put('/eventos/{evento}', [EventoController::class, 'update']);
    Route::delete('/eventos/{evento}', [EventoController::class, 'destroy']);
});
