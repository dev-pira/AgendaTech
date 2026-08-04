-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('presencial', 'online', 'hibrido');

-- CreateEnum
CREATE TYPE "PapelMembro" AS ENUM ('organizador', 'membro');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunidades" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT NOT NULL,
    "cidade" VARCHAR(100) NOT NULL,
    "contato" VARCHAR(255) NOT NULL,
    "logo_url" VARCHAR(500),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "criado_por" UUID NOT NULL,

    CONSTRAINT "comunidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "hora_inicio" VARCHAR(5) NOT NULL,
    "hora_fim" VARCHAR(5),
    "local" VARCHAR(300) NOT NULL,
    "tipo" "TipoEvento" NOT NULL,
    "url_online" VARCHAR(500),
    "comunidade_id" UUID NOT NULL,
    "organizador_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunidade_membros" (
    "comunidade_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "papel" "PapelMembro" NOT NULL,
    "adicionado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adicionado_por" UUID NOT NULL,

    CONSTRAINT "comunidade_membros_pkey" PRIMARY KEY ("comunidade_id","usuario_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "comunidades_cidade_idx" ON "comunidades"("cidade");

-- CreateIndex
CREATE UNIQUE INDEX "comunidades_nome_key" ON "comunidades"("nome");

-- CreateIndex
CREATE INDEX "eventos_comunidade_id_idx" ON "eventos"("comunidade_id");

-- CreateIndex
CREATE INDEX "eventos_data_idx" ON "eventos"("data");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_comunidade_titulo_data_key" ON "eventos"("comunidade_id", "titulo", "data");

-- AddForeignKey
ALTER TABLE "comunidades" ADD CONSTRAINT "comunidades_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_comunidade_id_fkey" FOREIGN KEY ("comunidade_id") REFERENCES "comunidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_organizador_id_fkey" FOREIGN KEY ("organizador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunidade_membros" ADD CONSTRAINT "comunidade_membros_comunidade_id_fkey" FOREIGN KEY ("comunidade_id") REFERENCES "comunidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunidade_membros" ADD CONSTRAINT "comunidade_membros_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunidade_membros" ADD CONSTRAINT "comunidade_membros_adicionado_por_fkey" FOREIGN KEY ("adicionado_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
