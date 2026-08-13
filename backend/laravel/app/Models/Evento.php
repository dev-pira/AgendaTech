<?php

namespace App\Models;

use App\Support\Auditavel;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\ValidationException;

/**
 * Regras de negócio replicadas de core/models.py (Django) — ver Comunidade
 * para o mesmo padrão (validação centralizada no model via evento saving).
 */
class Evento extends Model
{
    use Auditavel, HasFactory, HasUuids;

    protected $fillable = [
        'titulo', 'descricao', 'data', 'hora_inicio', 'hora_fim', 'local',
        'tipo', 'url_online', 'comunidade_id', 'organizador_id',
    ];

    public const PRESENCIAL = 'presencial';

    public const ONLINE = 'online';

    public const HIBRIDO = 'hibrido';

    public const TIPOS = [self::PRESENCIAL, self::ONLINE, self::HIBRIDO];

    protected $attributes = [
        'url_online' => '',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Evento $evento) {
            // url_online não é anulável no banco (mesmo padrão do blank=True
            // do Django); formulários web enviam '' como null via o
            // middleware ConvertEmptyStringsToNull, então normalizamos aqui.
            $evento->url_online ??= '';

            $evento->validarRegrasDeNegocio();
        });
    }

    public function validarRegrasDeNegocio(): void
    {
        $errors = [];

        if ($this->titulo !== null && ! (mb_strlen($this->titulo) >= 5 && mb_strlen($this->titulo) <= 200)) {
            $errors['titulo'] = 'O título deve ter entre 5 e 200 caracteres.';
        }

        if ($this->descricao !== null && mb_strlen($this->descricao) < 20) {
            $errors['descricao'] = 'A descrição deve ter no mínimo 20 caracteres.';
        }

        if (in_array($this->tipo, [self::ONLINE, self::HIBRIDO], true) && ! $this->url_online) {
            $errors['url_online'] = "url_online é obrigatório quando tipo é 'online' ou 'hibrido'.";
        }

        if ($this->hora_fim && $this->hora_inicio && $this->hora_fim <= $this->hora_inicio) {
            $errors['hora_fim'] = 'hora_fim deve ser posterior a hora_inicio.';
        }

        if ($errors) {
            throw ValidationException::withMessages($errors);
        }
    }

    public function comunidade(): BelongsTo
    {
        return $this->belongsTo(Comunidade::class);
    }

    public function organizador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizador_id');
    }
}
