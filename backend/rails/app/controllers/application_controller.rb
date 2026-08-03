# Views server-rendered (HTML puro, sem API). Espelha core/views.py
# (Django) / Http/Controllers/*.php (Laravel). A API fica numa hierarquia
# separada — ver app/controllers/api/base_controller.rb.
class ApplicationController < ActionController::Base
  helper_method :current_user, :logged_in?

  private

  def current_user
    @current_user ||= User.find_by(id: session[:user_id])
  end

  def logged_in?
    current_user.present?
  end

  def require_login
    return if logged_in?

    redirect_to login_path, alert: "Você precisa estar logado para acessar esta página."
  end
end
