module Api
  # Controller base da API REST — equivalente ao NinjaAPI (django-ninja) do
  # backend Django / Http/Controllers/Api/* do Laravel. Autenticação:
  # Bearer token simples (ver model Token). Para obter um token, use
  # POST /api/auth/token com username/password de um usuário já criado.
  class BaseController < ActionController::API
    include Api::Paginavel

    rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
    rescue_from ActionController::ParameterMissing, with: :render_parametro_ausente

    private

    def current_user
      @current_user ||= usuario_do_token
    end

    def usuario_do_token
      header = request.headers["Authorization"].to_s
      return nil unless header.start_with?("Bearer ")

      key = header.delete_prefix("Bearer ").strip
      Token.includes(:user).find_by(key: key)&.user
    end

    def authenticate!
      render json: { detail: "Autenticação necessária." }, status: :unauthorized unless current_user
    end

    def render_not_found
      render json: { detail: "Não encontrado." }, status: :not_found
    end

    def render_parametro_ausente(exception)
      render json: { detail: exception.message }, status: :bad_request
    end

    # Erros de unicidade (`validates ..., uniqueness: true`) viram 409, o
    # resto (tamanho, formato, presença) vira 400 — mesma distinção que a
    # versão Django faz entre IntegrityError (409) e ValidationError (400).
    def render_validation_errors(record)
      mensagens = record.errors.full_messages.join(" | ")
      duplicado = record.errors.details.values.flatten.any? { |detalhe| detalhe[:error] == :taken }
      render json: { detail: mensagens }, status: duplicado ? :conflict : :bad_request
    end
  end
end
