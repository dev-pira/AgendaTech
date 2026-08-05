module Api
  class EventosController < BaseController
    before_action :authenticate!, only: %i[create update destroy]
    before_action :set_evento, only: %i[show update destroy]

    # GET /api/eventos
    def index
      scope = Evento.includes(:comunidade, :organizador)
      scope = scope.where(comunidade_id: params[:comunidade_id]) if params[:comunidade_id].present?
      if params[:cidade].present?
        scope = scope.joins(:comunidade).where("LOWER(comunidades.cidade) = ?", params[:cidade].downcase)
      end
      scope = scope.where("data >= ?", params[:data_inicio]) if params[:data_inicio].present?
      scope = scope.where("data <= ?", params[:data_fim]) if params[:data_fim].present?
      scope = scope.where(tipo: params[:tipo]) if params[:tipo].present?

      itens, paginacao = paginar(scope, pagina: params.fetch(:pagina, 1), limite: params.fetch(:limite, 20))
      return if performed?

      render json: { dados: itens.map { |e| evento_json(e) }, paginacao: paginacao }
    end

    # GET /api/eventos/:id
    def show
      render json: evento_json(@evento, detail: true)
    end

    # POST /api/eventos
    def create
      comunidade = Comunidade.find_by(id: params[:comunidade_id])
      unless comunidade
        render json: { detail: "Comunidade não encontrada." }, status: :not_found
        return
      end

      # RN-EVT-07
      unless Permissions.membro_ou_organizador?(current_user, comunidade)
        render json: { detail: "Você precisa ser membro ou organizador desta comunidade para criar eventos." },
               status: :forbidden
        return
      end

      # RN-EVT-04
      data = params[:data].presence && Date.parse(params[:data].to_s)
      if data && data < Date.current
        render json: { detail: "A data do evento deve ser futura ou igual à data atual." }, status: :bad_request
        return
      end

      evento = Evento.new(evento_params)
      evento.comunidade = comunidade
      evento.organizador = current_user

      if evento.save
        render json: evento_json(evento, detail: true), status: :created
      else
        render_validation_errors(evento)
      end
    rescue ArgumentError, TypeError
      render json: { detail: "O parâmetro 'data' é inválido." }, status: :bad_request
    end

    # PUT /api/eventos/:id
    def update
      unless Permissions.organizador?(current_user, @evento.comunidade)
        render json: { detail: "Apenas organizadores da comunidade podem editar este evento." }, status: :forbidden
        return
      end

      # RN-EVT-10
      if @evento.data < Date.current
        render json: { detail: "Não é possível editar eventos que já ocorreram." }, status: :bad_request
        return
      end

      if @evento.update(evento_params.except(:comunidade_id))
        render json: evento_json(@evento, detail: true)
      else
        render_validation_errors(@evento)
      end
    end

    # DELETE /api/eventos/:id
    def destroy
      unless Permissions.organizador?(current_user, @evento.comunidade)
        render json: { detail: "Apenas organizadores da comunidade podem excluir este evento." }, status: :forbidden
        return
      end

      # RN-EVT-10
      if @evento.data < Date.current
        render json: { detail: "Não é possível excluir eventos que já ocorreram." }, status: :bad_request
        return
      end

      @evento.destroy
      head :no_content
    end

    private

    def set_evento
      @evento = Evento.find(params[:id])
    end

    def evento_params
      params.permit(:titulo, :descricao, :data, :hora_inicio, :hora_fim, :local, :tipo, :url_online, :comunidade_id)
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
  end
end
