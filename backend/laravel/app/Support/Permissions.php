<?php

namespace App\Support;

use App\Models\Comunidade;
use App\Models\ComunidadeMembro;
use App\Models\User;

/**
 * Checagens de papel usadas tanto pela API (Http/Controllers/Api) quanto
 * pelas views server-rendered (Http/Controllers) — mantidas em um único
 * lugar para não divergir entre as duas superfícies. Espelha
 * core/permissions.py do backend Django.
 */
class Permissions
{
    public static function isOrganizador(?User $user, Comunidade $comunidade): bool
    {
        if (! $user) {
            return false;
        }

        return ComunidadeMembro::query()
            ->where('comunidade_id', $comunidade->id)
            ->where('usuario_id', $user->id)
            ->where('papel', ComunidadeMembro::ORGANIZADOR)
            ->exists();
    }

    public static function isMembroOuOrganizador(?User $user, Comunidade $comunidade): bool
    {
        if (! $user) {
            return false;
        }

        return ComunidadeMembro::query()
            ->where('comunidade_id', $comunidade->id)
            ->where('usuario_id', $user->id)
            ->exists();
    }
}
