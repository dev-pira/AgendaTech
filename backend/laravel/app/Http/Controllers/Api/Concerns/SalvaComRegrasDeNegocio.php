<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Validation\ValidationException;

/**
 * Salva um model convertendo as exceções de validação/constraint em
 * respostas HTTP, espelhando o tratamento de DjangoValidationError e
 * IntegrityError em core/api.py (Django).
 */
trait SalvaComRegrasDeNegocio
{
    protected function salvarOuFalhar(Model $model, string $mensagemConflito): void
    {
        try {
            $model->save();
        } catch (ValidationException $e) {
            abort(400, collect($e->errors())->flatten()->implode(' | '));
        } catch (UniqueConstraintViolationException) {
            abort(409, $mensagemConflito);
        }
    }
}
