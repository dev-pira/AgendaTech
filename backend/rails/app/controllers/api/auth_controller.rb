module Api
  class AuthController < BaseController
    # POST /api/auth/token — autentica com username/password e devolve um
    # token Bearer para uso nas rotas protegidas.
    def token
      user = User.find_by(username: params[:username])

      unless user&.authenticate(params[:password])
        render json: { detail: "Credenciais inválidas." }, status: :unauthorized
        return
      end

      token = Token.find_or_create_by!(user: user)
      render json: { token: token.key }
    end
  end
end
