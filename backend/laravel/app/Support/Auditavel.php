<?php

namespace App\Support;

use App\Models\LogAuditoria;
use Illuminate\Support\Facades\Auth;

/**
 * Issue #101: registra automaticamente created/updated/deleted no log de
 * auditoria (logs_auditoria) pra qualquer model que usar essa trait.
 * Aplicado em Comunidade, Evento e ComunidadeMembro (mesmo escopo do
 * throttle:60,1 da issue #83 - as rotas de escrita "sensíveis").
 *
 * Ator vem do guard 'api' (Auth::guard('api')->id()) - a API inteira usa
 * JWT via esse guard (ver AppServiceProvider::boot), não o guard 'web'
 * de sessão. Fica null se não houver usuário autenticado resolvível no
 * momento (ex.: seeders, comandos artisan).
 */
trait Auditavel
{
    protected static function bootAuditavel(): void
    {
        static::created(function ($model) {
            static::registrarAuditoria($model, LogAuditoria::CRIADO);
        });

        static::updated(function ($model) {
            static::registrarAuditoria($model, LogAuditoria::ATUALIZADO);
        });

        static::deleted(function ($model) {
            static::registrarAuditoria($model, LogAuditoria::EXCLUIDO);
        });
    }

    protected static function registrarAuditoria($model, string $acao): void
    {
        LogAuditoria::create([
            'usuario_id' => Auth::guard('api')->id(),
            'acao' => $acao,
            'tabela' => $model->getTable(),
            'registro_id' => (string) $model->getKey(),
        ]);
    }
}
