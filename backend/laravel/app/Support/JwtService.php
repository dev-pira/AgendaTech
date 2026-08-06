<?php

namespace App\Support;

use App\Models\User;
use DomainException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use InvalidArgumentException;
use UnexpectedValueException;

/**
 * Emissão e verificação de JWT — tarefa 2.6 Autenticação JWT (issue #8
 * original, fechada Done no PR #12 quando a stack era Node + jsonwebtoken;
 * na migração pra Laravel virou um Bearer token opaco simples, tabela
 * `tokens`. Ver issue #52. Substitui completamente o model Token: JWT é
 * stateless, não precisa de tabela — o token carrega a própria validade.
 *
 * Espelha backend/src/services/auth.service.js (Node): payload com
 * apenas `sub` (id do usuário), assinado com HS256, expiração
 * configurável (config/jwt.php).
 */
class JwtService
{
    public static function encode(User $user): string
    {
        $agora = time();

        return JWT::encode([
            'sub' => $user->id,
            'iat' => $agora,
            'exp' => $agora + (config('jwt.ttl') * 60),
        ], config('jwt.secret'), config('jwt.algo'));
    }

    /**
     * Decodifica e valida o token. Devolve null (nunca lança) pra token
     * ausente, expirado, malformado ou de usuário que não existe mais —
     * quem chama só precisa saber "autenticado ou não".
     */
    public static function decode(string $token): ?User
    {
        try {
            // UnexpectedValueException cobre ExpiredException,
            // SignatureInvalidException e BeforeValidException — todas
            // são subclasses dela na biblioteca. DomainException e
            // InvalidArgumentException só disparam com config quebrada
            // (chave/algoritmo), mas viram 401 igual, nunca 500.
            $payload = JWT::decode($token, new Key(config('jwt.secret'), config('jwt.algo')));
        } catch (UnexpectedValueException|DomainException|InvalidArgumentException) {
            return null;
        }

        return User::find($payload->sub);
    }
}
