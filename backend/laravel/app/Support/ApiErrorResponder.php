<?php

namespace App\Support;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

/**
 * Formata exceptions da API em um envelope padronizado — tarefa 2.4
 * Validações (docs/wbs.md). Usado em bootstrap/app.php via
 * Exceptions::render(), só para rotas api/* (rotas web mantêm o
 * comportamento padrão do Laravel — redirect + erros de sessão).
 *
 * Formato: { "error": { "code": "...", "message": "..." } }, com
 * "fields" adicional em erros de validação (não quebra o contrato
 * mínimo pedido, só acrescenta o detalhe por campo).
 */
class ApiErrorResponder
{
    /** @var array<int, string> */
    private const CODES = [
        400 => 'BAD_REQUEST',
        401 => 'UNAUTHENTICATED',
        403 => 'FORBIDDEN',
        404 => 'NOT_FOUND',
        405 => 'METHOD_NOT_ALLOWED',
        409 => 'CONFLICT',
        422 => 'VALIDATION_ERROR',
        429 => 'TOO_MANY_REQUESTS',
        500 => 'INTERNAL_ERROR',
    ];

    public static function render(Throwable $e): JsonResponse
    {
        $status = self::statusFor($e);
        $code = self::CODES[$status] ?? 'ERROR';

        $body = [
            'error' => [
                'code' => $code,
                'message' => self::messageFor($e, $status),
            ],
        ];

        if ($e instanceof ValidationException) {
            $body['error']['fields'] = $e->errors();
        }

        return response()->json($body, $status);
    }

    private static function statusFor(Throwable $e): int
    {
        return match (true) {
            $e instanceof ValidationException => $e->status,
            $e instanceof AuthenticationException => 401,
            $e instanceof AuthorizationException => 403,
            $e instanceof HttpExceptionInterface => $e->getStatusCode(),
            default => 500,
        };
    }

    private static function messageFor(Throwable $e, int $status): string
    {
        if ($e instanceof ValidationException) {
            return 'Os dados enviados são inválidos.';
        }

        // Erros 5xx não expõem a mensagem original — pode conter detalhes
        // internos (query, stack, etc.). Ver fix(backend): corrige race
        // condition que vazava 500 com detalhes internos (commit 3446753).
        if ($status >= 500) {
            return 'Ocorreu um erro interno no servidor.';
        }

        return $e->getMessage() !== '' ? $e->getMessage() : 'Ocorreu um erro ao processar a requisição.';
    }
}
