<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Usuário da plataforma. Papéis (organizador/membro) são por comunidade,
 * ver ComunidadeMembro — não existe flag global de papel no usuário.
 */
#[Fillable(['username', 'email', 'first_name', 'last_name', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasUuids, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function nomeExibicao(): string
    {
        $nomeCompleto = trim("{$this->first_name} {$this->last_name}");

        return $nomeCompleto !== '' ? $nomeCompleto : $this->username;
    }

    public function token(): HasOne
    {
        return $this->hasOne(Token::class);
    }

    public function comunidadesCriadas(): HasMany
    {
        return $this->hasMany(Comunidade::class, 'criado_por_id');
    }

    public function eventosOrganizados(): HasMany
    {
        return $this->hasMany(Evento::class, 'organizador_id');
    }

    public function comunidades(): BelongsToMany
    {
        return $this->belongsToMany(Comunidade::class, 'comunidade_membros', 'usuario_id', 'comunidade_id')
            ->using(ComunidadeMembro::class)
            ->withPivot('papel', 'adicionado_em', 'adicionado_por_id');
    }
}
