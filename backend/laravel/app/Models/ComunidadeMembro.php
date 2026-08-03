<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[Fillable(['comunidade_id', 'usuario_id', 'papel', 'adicionado_por_id'])]
class ComunidadeMembro extends Pivot
{
    public const ORGANIZADOR = 'organizador';

    public const MEMBRO = 'membro';

    public $incrementing = true;

    public $timestamps = false;

    protected $table = 'comunidade_membros';

    protected $attributes = [
        'papel' => self::MEMBRO,
    ];

    protected static function booted(): void
    {
        static::creating(function (ComunidadeMembro $vinculo) {
            if (! $vinculo->adicionado_em) {
                $vinculo->adicionado_em = now();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'adicionado_em' => 'datetime',
        ];
    }

    public function comunidade(): BelongsTo
    {
        return $this->belongsTo(Comunidade::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function adicionadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'adicionado_por_id');
    }
}
