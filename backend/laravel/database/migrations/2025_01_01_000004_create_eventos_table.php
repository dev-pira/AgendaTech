<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eventos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('titulo', 200);
            $table->text('descricao');
            $table->date('data');
            $table->time('hora_inicio');
            $table->time('hora_fim')->nullable();
            $table->string('local', 300);
            $table->enum('tipo', ['presencial', 'online', 'hibrido']);
            $table->string('url_online', 500)->default('');
            $table->foreignUuid('comunidade_id')->constrained('comunidades')->cascadeOnDelete();
            $table->foreignUuid('organizador_id')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            // RN-EVT-09: não pode haver dois eventos com o mesmo título e data na mesma comunidade.
            $table->unique(['comunidade_id', 'titulo', 'data'], 'unique_evento_titulo_data_por_comunidade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eventos');
    }
};
