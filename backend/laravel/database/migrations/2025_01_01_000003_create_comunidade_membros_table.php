<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comunidade_membros', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('comunidade_id')->constrained('comunidades')->cascadeOnDelete();
            $table->foreignUuid('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->enum('papel', ['organizador', 'membro'])->default('membro');
            $table->timestamp('adicionado_em')->useCurrent();
            $table->foreignUuid('adicionado_por_id')->nullable()->constrained('users')->restrictOnDelete();

            $table->unique(['comunidade_id', 'usuario_id'], 'unique_membro_por_comunidade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comunidade_membros');
    }
};
