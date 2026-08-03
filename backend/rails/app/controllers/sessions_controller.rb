# Login/logout — equivalente ao LoginView/LogoutView do Django e ao
# AuthController do Laravel.
class SessionsController < ApplicationController
  def new
    redirect_to comunidades_path if logged_in?
  end

  def create
    user = User.find_by(username: params[:username])

    if user&.authenticate(params[:password])
      session[:user_id] = user.id
      redirect_to comunidades_path, notice: "Login realizado com sucesso."
    else
      flash.now[:alert] = "Usuário ou senha inválidos."
      render :new, status: :unprocessable_content
    end
  end

  def destroy
    session.delete(:user_id)
    @current_user = nil
    redirect_to login_path, notice: "Você saiu da sua conta."
  end
end
