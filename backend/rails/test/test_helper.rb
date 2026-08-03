ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

# Helpers de fixture usados pelos testes — espelha core/tests/helpers.py
# (Django) / tests/Concerns/CriaDados.php (Laravel). Não usamos fixtures
# YAML: cada teste cria os próprios dados via estes helpers, dentro da
# transação que o Rails desfaz automaticamente ao final do teste.
module TestHelpers
  DEFAULT_PASSWORD = "StrongPass123!"

  def make_user(**overrides)
    n = next_seq
    defaults = { username: "user#{n}", email: "user#{n}@example.com", password: DEFAULT_PASSWORD }
    User.create!(defaults.merge(overrides))
  end

  def auth_header(user)
    token = Token.find_or_create_by!(user: user)
    { "Authorization" => "Bearer #{token.key}" }
  end

  # Faz login "de verdade" via POST /login, mantendo a sessão (cookies) para
  # as próximas requisições do teste de integração — não existe um atalho
  # tipo Devise#sign_in nesta versão sem gems extras.
  def sign_in(user, password: DEFAULT_PASSWORD)
    post login_path, params: { username: user.username, password: password }
  end

  # O model Comunidade já adiciona o criador como organizador
  # automaticamente (RN-COM-08 / RN-ORG-04, ver app/models/comunidade.rb).
  def make_comunidade(criador, **overrides)
    n = next_seq
    defaults = {
      nome: "Comunidade #{n}",
      descricao: "Uma comunidade de tecnologia para testes automatizados.",
      cidade: "Piracicaba",
      contato: "contato@example.com"
    }
    Comunidade.create!(defaults.merge(overrides).merge(criado_por: criador))
  end

  def add_membro(comunidade, usuario, papel: ComunidadeMembro::MEMBRO, adicionado_por: nil)
    ComunidadeMembro.create!(comunidade: comunidade, usuario: usuario, papel: papel, adicionado_por: adicionado_por)
  end

  def make_evento(comunidade, organizador, **overrides)
    n = next_seq
    defaults = {
      titulo: "Evento de teste #{n}",
      descricao: "Descrição detalhada do evento de teste automatizado.",
      data: Date.current + 7,
      hora_inicio: "19:00",
      local: "Rua dos Devs, 100",
      tipo: Evento::PRESENCIAL
    }
    Evento.create!(defaults.merge(overrides).merge(comunidade: comunidade, organizador: organizador))
  end

  private

  def next_seq
    @__seq = (@__seq || 0) + 1
  end
end

module ActiveSupport
  class TestCase
    include TestHelpers

    # Paralelização desligada: com MySQL, cada worker recria seu próprio
    # banco (agendatech_test-0, -1, ...) e, nesta suíte, isso disparava
    # "Table definition has changed, please retry transaction" de forma
    # intermitente. Com ~100 testes a suíte já roda em segundos mesmo
    # sequencial — não vale a pena a flakiness.
    parallelize(workers: 1)
  end
end
