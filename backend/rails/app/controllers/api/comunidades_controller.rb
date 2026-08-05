module Api
  class ComunidadesController < BaseController
    before_action :authenticate!, only: %i[create update destroy]
    before_action :set_comunidade, only: %i[show update destroy eventos]

    # GET /api/comunidades
    def index
      scope = Comunidade.all
      scope = scope.where("LOWER(cidade) = ?", params[:cidade].downcase) if params[:cidade].present?

      itens, paginacao = paginar(scope, pagina: params.fetch(:pagina, 1), limite: params.fetch(:limite, 20))
      return if performed?

      render json: { dados: itens.map { |c| comunidade_json(c) }, paginacao: paginacao }
    end

    # GET /api/comunidades/:id
    def show
      render json: comunidade_json(@comunidade, detail: true)
    end

    # POST /api/comunidades
    def create
      comunidade = Comunidade.new(comunidade_params)
      comunidade.criado_por = current_user

      if comunidade.save
        render json: comunidade_json(comunidade, detail: true), status: :created
      else
        render_validation_errors(comunidade)
      end
    end

    # PUT /api/comunidades/:id
    def update
      unless Permissions.organizador?(current_user, @comunidade)
        render json: { detail: "Apenas organizadores podem editar esta comunidade." }, status: :forbidden
        return
      end

      if @comunidade.update(comunidade_params)
        render json: comunidade_json(@comunidade, detail: true)
      else
        render_validation_errors(@comunidade)
      end
    end

    # DELETE /api/comunidades/:id
    def destroy
      unless Permissions.organizador?(current_user, @comunidade)
        render json: { detail: "Apenas organizadores podem excluir esta comunidade." }, status: :forbidden
        return
      end

      # RN-COM-09
      if @comunidade.eventos.where("data >= ?", Date.current).exists?
        render json: { detail: "Não é possível excluir uma comunidade com eventos futuros agendados." },
               status: :bad_request
        return
      end

      @comunidade.destroy
      head :no_content
    end

    # GET /api/comunidades/:id/eventos
    def eventos
      scope = @comunidade.eventos.includes(:comunidade, :organizador)
      scope = scope.where("data >= ?", params[:data_inicio]) if params[:data_inicio].present?
      scope = scope.where("data <= ?", params[:data_fim]) if params[:data_fim].present?

      itens, paginacao = paginar(scope, pagina: params.fetch(:pagina, 1), limite: params.fetch(:limite, 20))
      return if performed?

      render json: { dados: itens.map { |e| evento_json(e) }, paginacao: paginacao }
    end

    private

    def set_comunidade
      @comunidade = Comunidade.find(params[:id])
    end

    def comunidade_params
      params.permit(:nome, :descricao, :cidade, :contato, :logo_url)
    end

    def comunidade_json(comunidade, detail: false)
      base = {
        id: comunidade.id,
        nome: comunidade.nome,
        descricao: comunidade.descricao,
        cidade: comunidade.cidade,
        contato: comunidade.contato,
        logo_url: comunidade.logo_url,
        criado_em: comunidade.created_at,
        total_membros: comunidade.total_membros
      }
      return base unless detail

      base.merge(
        atualizado_em: comunidade.updated_at,
        criado_por: usuario_resumo_json(comunidade.criado_por),
        membros: comunidade.comunidade_membros.includes(:usuario).order(:adicionado_em).map { |m| membro_json(m) }
      )
    end

    def evento_json(evento, detail: false)
      base = {
        id: evento.id,
        titulo: evento.titulo,
        descricao: evento.descricao,
        data: evento.data,
        hora_inicio: evento.hora_inicio.strftime("%H:%M:%S"),
        hora_fim: evento.hora_fim&.strftime("%H:%M:%S"),
        local: evento.local,
        tipo: evento.tipo,
        comunidade: { id: evento.comunidade.id, nome: evento.comunidade.nome },
        organizador: usuario_resumo_json(evento.organizador)
      }
      return base unless detail

      base.merge(
        url_online: evento.url_online,
        comunidade: { id: evento.comunidade.id, nome: evento.comunidade.nome, cidade: evento.comunidade.cidade },
        criado_em: evento.created_at,
        atualizado_em: evento.updated_at
      )
    end

    def usuario_resumo_json(user)
      { id: user.id, nome: user.nome_exibicao }
    end

    def membro_json(membro)
      { usuario_id: membro.usuario_id, nome: membro.usuario.nome_exibicao, papel: membro.papel }
    end
  end
end
