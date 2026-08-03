require "test_helper"

class ComunidadeTest < ActiveSupport::TestCase
  setup do
    @organizador = make_user
  end

  test "created" do
    make_comunidade(@organizador, nome: "DEVPIRA")
    assert Comunidade.exists?(nome: "DEVPIRA")
  end

  test "criador é adicionado como organizador" do
    comunidade = make_comunidade(@organizador)
    vinculo = comunidade.comunidade_membros.find_by!(usuario: @organizador)
    assert_equal "organizador", vinculo.papel
  end

  test "nome muito curto é inválido" do
    comunidade = Comunidade.new(
      nome: "ab", descricao: "Descrição válida e longa o suficiente.",
      cidade: "Piracicaba", contato: "contato@example.com", criado_por: @organizador
    )
    assert_not comunidade.valid?
    assert comunidade.errors[:nome].present?
  end

  test "descrição muito curta é inválida" do
    assert_raises(ActiveRecord::RecordInvalid) do
      make_comunidade(@organizador, descricao: "curta")
    end
  end

  test "contato inválido é inválido" do
    assert_raises(ActiveRecord::RecordInvalid) do
      make_comunidade(@organizador, contato: "nao-e-email-nem-url")
    end
  end

  test "logo_url sem extensão de imagem é inválida" do
    assert_raises(ActiveRecord::RecordInvalid) do
      make_comunidade(@organizador, logo_url: "https://example.com/logo.pdf")
    end
  end

  test "logo_url válida é aceita" do
    comunidade = make_comunidade(@organizador, logo_url: "https://example.com/logo.png")
    assert_equal "https://example.com/logo.png", comunidade.logo_url
  end

  test "nome duplicado (case-insensitive) é inválido" do
    make_comunidade(@organizador, nome: "DEVPIRA")
    assert_raises(ActiveRecord::RecordInvalid) do
      make_comunidade(@organizador, nome: "devpira")
    end
  end

  test "total_membros conta os vínculos da comunidade" do
    comunidade = make_comunidade(@organizador)
    add_membro(comunidade, make_user)
    assert_equal 2, comunidade.total_membros
  end
end
