<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Validator as ValidatorFacade;
use Illuminate\Validation\ValidationException;

/**
 * Regras de negócio replicadas de core/models.py (Django). A validação fica
 * aqui, no model, para ser compartilhada pelas duas superfícies (web e API)
 * — ver docstring de app/Http/Controllers/Api/*Controller.php.
 */
#[Fillable(['nome', 'descricao', 'cidade', 'contato', 'logo_url', 'criado_por_id'])]
class Comunidade extends Model
{
    use HasFactory, HasUuids;

    public const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'webp'];

    protected $attributes = [
        'logo_url' => '',
    ];

    protected static function booted(): void
    {
        static::saving(function (Comunidade $comunidade) {
            // logo_url não é anulável no banco (mesmo padrão do blank=True do
            // Django); formulários web enviam '' como null via o middleware
            // ConvertEmptyStringsToNull, então normalizamos de volta aqui.
            $comunidade->logo_url ??= '';

            $comunidade->validarRegrasDeNegocio();
        });
    }

    public function validarRegrasDeNegocio(): void
    {
        $errors = [];

        if ($this->nome !== null && ! (mb_strlen($this->nome) >= 3 && mb_strlen($this->nome) <= 100)) {
            $errors['nome'] = 'O nome deve ter entre 3 e 100 caracteres.';
        }

        if ($this->descricao !== null && mb_strlen($this->descricao) < 10) {
            $errors['descricao'] = 'A descrição deve ter no mínimo 10 caracteres.';
        }

        if ($this->contato && ! $this->contatoValido($this->contato)) {
            $errors['contato'] = 'O campo contato deve ser um e-mail válido ou uma URL válida.';
        }

        if ($this->logo_url && ! $this->logoUrlValida($this->logo_url)) {
            $errors['logo_url'] = 'logo_url deve terminar com uma extensão de imagem ('
                .implode(', ', array_map(fn ($ext) => ".$ext", self::IMAGE_EXTENSIONS)).').';
        }

        if ($errors) {
            throw ValidationException::withMessages($errors);
        }
    }

    private function contatoValido(string $value): bool
    {
        $validator = ValidatorFacade::make(['contato' => $value], ['contato' => ['email']]);
        if (! $validator->fails()) {
            return true;
        }

        $validator = ValidatorFacade::make(['contato' => $value], ['contato' => ['url']]);

        return ! $validator->fails();
    }

    private function logoUrlValida(string $value): bool
    {
        $validator = ValidatorFacade::make(['logo_url' => $value], ['logo_url' => ['url']]);
        if ($validator->fails()) {
            return false;
        }

        $extensao = mb_strtolower(pathinfo(parse_url($value, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION));

        return in_array($extensao, self::IMAGE_EXTENSIONS, true);
    }

    public function criadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'criado_por_id');
    }

    public function membrosVinculo(): HasMany
    {
        return $this->hasMany(ComunidadeMembro::class)->orderBy('adicionado_em');
    }

    public function membros(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'comunidade_membros', 'comunidade_id', 'usuario_id')
            ->using(ComunidadeMembro::class)
            ->withPivot('papel', 'adicionado_em', 'adicionado_por_id');
    }

    public function eventos(): HasMany
    {
        return $this->hasMany(Evento::class);
    }

    public static function nomeDuplicado(string $nome, ?string $exceptId = null): bool
    {
        $query = static::whereRaw('LOWER(nome) = ?', [mb_strtolower($nome)]);
        if ($exceptId) {
            $query->where('id', '!=', $exceptId);
        }

        return $query->exists();
    }
}
