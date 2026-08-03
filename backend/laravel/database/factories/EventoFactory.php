<?php

namespace Database\Factories;

use App\Models\Comunidade;
use App\Models\Evento;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Evento>
 */
class EventoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'titulo' => 'Evento de teste '.fake()->unique()->numberBetween(1, 1000000),
            'descricao' => 'Descrição detalhada do evento de teste automatizado.',
            'data' => now()->addDays(7)->toDateString(),
            'hora_inicio' => '19:00:00',
            'hora_fim' => null,
            'local' => 'Rua dos Devs, 100',
            'tipo' => Evento::PRESENCIAL,
            'url_online' => '',
            'comunidade_id' => Comunidade::factory(),
            'organizador_id' => User::factory(),
        ];
    }
}
