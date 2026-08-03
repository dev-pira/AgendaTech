<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Validation\ValidationException;

/**
 * Salva um model num formulário web, convertendo violações de constraint
 * em erros de validação redirecionados de volta ao formulário — a mesma
 * ideia de app/Http/Controllers/Api/Concerns/SalvaComRegrasDeNegocio.php,
 * mas devolvendo um redirect (padrão Laravel) em vez de abortar com JSON.
 */
trait SalvaFormulario
{
    protected function salvarOuVoltar(Model $model, string $campoConflito, string $mensagemConflito): void
    {
        try {
            $model->save();
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages([$campoConflito => $mensagemConflito]);
        }
    }
}
