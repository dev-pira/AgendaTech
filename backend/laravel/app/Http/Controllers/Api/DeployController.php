<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Gatilho de deploy via HTTP. Substitui o step de SSH do GitHub Actions
 * (appleboy/ssh-action), que nunca funcionou nesse host - o king.host
 * bloqueia conexao SSH de entrada vinda de fora da faixa de IP
 * autorizada, e a faixa de IPs do runner do GitHub Actions e dinamica
 * demais pra cadastrar (ver issue #31, docs/deploy.md).
 *
 * Em vez disso, o workflow faz um POST HTTP simples pra essa rota (nunca
 * teve o mesmo bloqueio - e o mesmo tipo de chamada que os steps de
 * "Notify success/failure" ja fazem contra a API do GitHub). A rota
 * autentica via segredo compartilhado (header X-Deploy-Secret,
 * comparacao constant-time) e roda o deploy_agendatech.sh via
 * shell_exec - confirmado liberado no PHP desse host
 * (disable_functions vazio, checado em 10/08/2026).
 */
class DeployController extends Controller
{
    public function trigger(Request $request)
    {
        $secretConfigurado = config('services.deploy.secret');
        $secretRecebido = $request->header('X-Deploy-Secret', '');

        if (! $secretConfigurado || ! hash_equals($secretConfigurado, $secretRecebido)) {
            abort(403, 'Segredo invalido ou nao configurado.');
        }

        // composer install + migrate + cache podem levar mais que os 30s
        // padrao do PHP - da margem sem deixar rodar pra sempre.
        set_time_limit(120);

        $comando = 'bash ~/deploy_agendatech.sh 2>&1';
        $saida = shell_exec($comando);

        Log::info('Deploy disparado via HTTP', ['saida' => $saida]);

        return response()->json([
            'ok' => true,
            'saida' => $saida,
        ]);
    }
}
