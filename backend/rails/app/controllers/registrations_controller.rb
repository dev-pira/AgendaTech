# Cadastro de novo usuário — equivalente à view `cadastro` do Django e ao
# AuthController#cadastro do Laravel. Já efetua login automático após o
# cadastro.
class RegistrationsController < ApplicationController
  def new
    if logged_in?
      redirect_to comunidades_path
      return
    end

    @user = User.new
  end

  def create
    if logged_in?
      redirect_to comunidades_path
      return
    end

    @user = User.new(cadastro_params)

    if @user.save
      session[:user_id] = @user.id
      redirect_to comunidades_path, notice: "Cadastro realizado com sucesso. Bem-vindo(a)!"
    else
      render :new, status: :unprocessable_content
    end
  end

  private

  def cadastro_params
    params.require(:user).permit(:username, :email, :first_name, :last_name, :password, :password_confirmation)
  end
end
