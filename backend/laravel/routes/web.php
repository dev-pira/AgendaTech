<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ComunidadeController;
use App\Http\Controllers\EventoController;
use Illuminate\Support\Facades\Route;

// Espelha core/urls.py (Django) — sem barra final, seguindo a convenção
// do Laravel (ele normaliza/ignora a barra final de qualquer forma).
// Rotas literais (nova/novo) precisam vir antes das rotas com parâmetro
// ({comunidade}, {evento}) para não serem capturadas por elas.

Route::get('/', [AuthController::class, 'home'])->name('home');

Route::get('/cadastro', [AuthController::class, 'mostrarCadastro'])->name('cadastro');
Route::post('/cadastro', [AuthController::class, 'cadastro'])->name('cadastro.store');

Route::get('/login', [AuthController::class, 'mostrarLogin'])->name('login');
// Issue #76: sem throttle, dava pra tentar senha infinitas vezes.
Route::post('/login', [AuthController::class, 'login'])->name('login.store')->middleware('throttle:5,1');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/comunidades', [ComunidadeController::class, 'index'])->name('comunidades.index');

Route::middleware('auth')->group(function () {
    Route::get('/comunidades/nova', [ComunidadeController::class, 'create'])->name('comunidades.create');
    Route::post('/comunidades/nova', [ComunidadeController::class, 'store'])->name('comunidades.store');
});

Route::get('/comunidades/{comunidade}', [ComunidadeController::class, 'show'])->name('comunidades.show');

Route::middleware('auth')->group(function () {
    Route::get('/comunidades/{comunidade}/editar', [ComunidadeController::class, 'edit'])->name('comunidades.edit');
    Route::put('/comunidades/{comunidade}/editar', [ComunidadeController::class, 'update'])->name('comunidades.update');
    Route::get('/comunidades/{comunidade}/excluir', [ComunidadeController::class, 'confirmDelete'])->name('comunidades.confirm-delete');
    Route::delete('/comunidades/{comunidade}/excluir', [ComunidadeController::class, 'destroy'])->name('comunidades.destroy');
});

Route::get('/eventos', [EventoController::class, 'index'])->name('eventos.index');

Route::middleware('auth')->group(function () {
    Route::get('/eventos/novo', [EventoController::class, 'create'])->name('eventos.create');
    Route::post('/eventos/novo', [EventoController::class, 'store'])->name('eventos.store');
});

Route::get('/eventos/{evento}', [EventoController::class, 'show'])->name('eventos.show');

Route::middleware('auth')->group(function () {
    Route::get('/eventos/{evento}/editar', [EventoController::class, 'edit'])->name('eventos.edit');
    Route::put('/eventos/{evento}/editar', [EventoController::class, 'update'])->name('eventos.update');
    Route::get('/eventos/{evento}/excluir', [EventoController::class, 'confirmDelete'])->name('eventos.confirm-delete');
    Route::delete('/eventos/{evento}/excluir', [EventoController::class, 'destroy'])->name('eventos.destroy');
});
