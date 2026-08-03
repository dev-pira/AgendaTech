require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module AgendaTech
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.1

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Mesmo fuso horário da versão Django (America/Sao_Paulo). O locale de
    # I18n fica em :en (padrão do Rails) para aproveitar as mensagens de
    # erro nativas do framework sem precisar traduzir todo o dicionário;
    # as mensagens das regras de negócio (ver app/models) são escritas
    # em português diretamente, como nas versões Django e Laravel.
    config.time_zone = "America/Sao_Paulo"

    # Esta aplicação serve páginas HTML (ActionController::Base) e uma API
    # JSON "fina" sob /api (ActionController::API) — ver
    # app/controllers/api/base_controller.rb.
    config.api_only = false
  end
end
