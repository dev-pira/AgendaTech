<?php

namespace Database\Factories;

use App\Models\Comunidade;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Comunidade>
 */
class ComunidadeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome' => 'Comunidade '.fake()->unique()->numberBetween(1, 1000000),
            'descricao' => 'Uma comunidade de tecnologia para testes automatizados.',
            'cidade' => 'Piracicaba',
            'contato' => 'contato@example.com',
            'logo_url' => '',
            'criado_por_id' => User::factory(),
        ];
    }
}
