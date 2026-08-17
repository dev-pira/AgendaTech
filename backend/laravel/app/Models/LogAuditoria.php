<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Log de auditoria — issue #101. Registro imutável de quem fez o quê
 * (ator, ação CUD, tabela, id do registro, data/hora). Escrito
 * automaticamente via App\Support\Auditavel, aplicado nos models
 * rastreados (Comunidade, Evento, ComunidadeMembro).
 */
class LogAuditoria extends Model
{
    public const CRIADO = 'criado';

    public const ATUALIZADO = 'atualizado';

    public const EXCLUIDO = 'excluido';

    protected $table = 'logs_auditoria';

    protected $fillable = ['usuario_id', 'acao', 'tabela', 'registro_id'];

    // Log é imutável - só criado_em, nunca atualizado_em.
    const CREATED_AT = 'criado_em';

    const UPDATED_AT = null;

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
