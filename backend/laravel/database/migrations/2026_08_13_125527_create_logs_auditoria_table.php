<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Issue #101: log simples de auditoria (ator, ação CUD, tabela,
        // id do registro, data/horário) - escopo decidido pelo Fabio em
        // 13/08/2026, sem pacote externo (spatie/laravel-activitylog).
        Schema::create('logs_auditoria', function (Blueprint $table) {
            $table->id();
            // Nullable porque nem toda escrita necessariamente tem um
            // usuario autenticado resolvivel no momento (ex.: seeders,
            // comandos artisan futuros) - preferimos logar sem ator a
            // não logar nada.
            $table->foreignUuid('usuario_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('acao', ['criado', 'atualizado', 'excluido']);
            $table->string('tabela', 100);
            // string (não uuid) porque nem todo registro auditado tem PK
            // uuid - comunidade_membros usa id incremental (bigint).
            $table->string('registro_id', 100);
            $table->timestamp('criado_em')->useCurrent();

            $table->index(['tabela', 'registro_id']);
            $table->index('usuario_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logs_auditoria');
    }
};
