<?php

namespace App\Providers;

use App\Models\Token;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // A API do Django (django-ninja) devolve o objeto "cru", sem
        // envelope {"data": ...}. Desligamos o auto-wrap do Laravel para
        // manter o mesmo contrato JSON nos endpoints que retornam um
        // único recurso (ex.: GET /api/comunidades/{id}).
        JsonResource::withoutWrapping();

        // Autenticação Bearer simples usada pela API — equivalente ao
        // AuthBearer (django-ninja HttpBearer) do backend Django.
        Auth::viaRequest('bearer-token', function ($request) {
            $header = $request->header('Authorization', '');

            if (! str_starts_with($header, 'Bearer ')) {
                return null;
            }

            $key = trim(substr($header, 7));

            return Token::with('user')->where('key', $key)->first()?->user;
        });
    }
}
