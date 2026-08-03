<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comunidades', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nome', 100);
            $table->text('descricao');
            $table->string('cidade', 100);
            $table->string('contato', 255);
            $table->string('logo_url', 500)->default('');
            $table->foreignUuid('criado_por_id')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });

        // RN-COM-02: nome único, sem diferenciar maiúsculas/minúsculas.
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            DB::statement('CREATE UNIQUE INDEX comunidades_nome_ci_unique ON comunidades (nome COLLATE NOCASE)');
        } else {
            Schema::table('comunidades', function (Blueprint $table) {
                $table->unique('nome', 'comunidades_nome_ci_unique');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('comunidades');
    }
};
