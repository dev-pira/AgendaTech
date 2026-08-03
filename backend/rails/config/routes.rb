Rails.application.routes.draw do
  # Espelha core/urls.py (Django) / routes/web.php (Laravel). Rotas
  # literais (nova/novo) precisam vir antes das rotas com parâmetro
  # (:id) para não serem capturadas por elas.

  root to: redirect("/comunidades")

  get "cadastro", to: "registrations#new", as: :cadastro
  post "cadastro", to: "registrations#create"

  get "login", to: "sessions#new", as: :login
  post "login", to: "sessions#create"
  delete "logout", to: "sessions#destroy", as: :logout
  post "logout", to: "sessions#destroy"

  get "comunidades", to: "comunidades#index", as: :comunidades
  get "comunidades/nova", to: "comunidades#new", as: :new_comunidade
  post "comunidades/nova", to: "comunidades#create"
  get "comunidades/:id", to: "comunidades#show", as: :comunidade
  get "comunidades/:id/editar", to: "comunidades#edit", as: :edit_comunidade
  put "comunidades/:id/editar", to: "comunidades#update"
  get "comunidades/:id/excluir", to: "comunidades#confirm_delete", as: :confirm_delete_comunidade
  delete "comunidades/:id/excluir", to: "comunidades#destroy"

  get "eventos", to: "eventos#index", as: :eventos
  get "eventos/novo", to: "eventos#new", as: :new_evento
  post "eventos/novo", to: "eventos#create"
  get "eventos/:id", to: "eventos#show", as: :evento
  get "eventos/:id/editar", to: "eventos#edit", as: :edit_evento
  put "eventos/:id/editar", to: "eventos#update"
  get "eventos/:id/excluir", to: "eventos#confirm_delete", as: :confirm_delete_evento
  delete "eventos/:id/excluir", to: "eventos#destroy"

  namespace :api do
    post "auth/token", to: "auth#token"

    get "comunidades", to: "comunidades#index"
    post "comunidades", to: "comunidades#create"
    get "comunidades/:id", to: "comunidades#show"
    put "comunidades/:id", to: "comunidades#update"
    delete "comunidades/:id", to: "comunidades#destroy"
    get "comunidades/:id/eventos", to: "comunidades#eventos"

    get "eventos", to: "eventos#index"
    post "eventos", to: "eventos#create"
    get "eventos/:id", to: "eventos#show"
    put "eventos/:id", to: "eventos#update"
    delete "eventos/:id", to: "eventos#destroy"
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
