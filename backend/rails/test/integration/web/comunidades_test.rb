require "test_helper"

class ComunidadesTest < ActionDispatch::IntegrationTest
  def payload_comunidade
    {
      comunidade: {
        nome: "DevCity",
        descricao: "Comunidade local de desenvolvedores.",
        cidade: "São Paulo",
        contato: "dev@city.com",
        logo_url: ""
      }
    }
  end

  test "lista retorna 200 e lista comunidades" do
    organizador = make_user
    make_comunidade(organizador, nome: "DEVPIRA")
    make_comunidade(organizador, nome: "DevLimeira")

    get comunidades_path

    assert_response :ok
    assert_match "DEVPIRA", response.body
    assert_match "DevLimeira", response.body
  end

  test "lista filtra por busca" do
    organizador = make_user
    make_comunidade(organizador, nome: "DEVPIRA")
    make_comunidade(organizador, nome: "DevLimeira")

    get comunidades_path, params: { busca: "DEVPIRA" }

    assert_match "DEVPIRA", response.body
    assert_no_match(/DevLimeira/, response.body)
  end

  test "lista filtra por cidade" do
    organizador = make_user
    make_comunidade(organizador, nome: "PiraTech", cidade: "Piracicaba")
    make_comunidade(organizador, nome: "DevLimeira", cidade: "Limeira")

    get comunidades_path, params: { cidade: "Limeira" }

    assert_no_match(/PiraTech/, response.body)
    assert_match "DevLimeira", response.body
  end

  test "lista sem resultados mostra mensagem vazia" do
    get comunidades_path
    assert_match "Nenhuma comunidade encontrada", response.body
  end

  test "detalhe retorna 200 com dados" do
    organizador = make_user
    comunidade = make_comunidade(organizador, nome: "DEVPIRA")

    get comunidade_path(comunidade)

    assert_response :ok
    assert_match "DEVPIRA", response.body
  end

  test "detalhe com id inexistente retorna 404" do
    get "/comunidades/00000000-0000-0000-0000-000000000000"
    assert_response :not_found
  end

  test "botões de gestão ocultos para visitante" do
    organizador = make_user
    comunidade = make_comunidade(organizador)

    get comunidade_path(comunidade)

    assert_no_match(/#{Regexp.escape(edit_comunidade_path(comunidade))}/, response.body)
  end

  test "botões de gestão visíveis para organizador" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    sign_in(organizador)

    get comunidade_path(comunidade)

    assert_match(/#{Regexp.escape(edit_comunidade_path(comunidade))}/, response.body)
  end

  test "criar anônimo é redirecionado para login" do
    get new_comunidade_path
    assert_redirected_to login_path
  end

  test "criar GET autenticado retorna 200" do
    organizador = make_user
    sign_in(organizador)

    get new_comunidade_path

    assert_response :ok
  end

  test "criar POST válido cria e redireciona para o detalhe" do
    organizador = make_user
    sign_in(organizador)

    post new_comunidade_path, params: payload_comunidade

    comunidade = Comunidade.find_by!(nome: "DevCity")
    assert_redirected_to comunidade_path(comunidade)
  end

  test "criador vira organizador automaticamente" do
    organizador = make_user
    sign_in(organizador)

    post new_comunidade_path, params: payload_comunidade

    comunidade = Comunidade.find_by!(nome: "DevCity")
    vinculo = comunidade.comunidade_membros.find_by!(usuario: organizador)
    assert_equal "organizador", vinculo.papel
  end

  test "nome duplicado reexibe formulário com erro" do
    organizador = make_user
    make_comunidade(organizador, nome: "DevCity")
    sign_in(organizador)

    post new_comunidade_path, params: payload_comunidade

    assert_response :unprocessable_content
    assert_match "Já existe uma comunidade com este nome", response.body
  end

  test "organizador atualiza com sucesso" do
    organizador = make_user
    comunidade = make_comunidade(organizador, nome: "DEVPIRA")
    sign_in(organizador)

    put edit_comunidade_path(comunidade), params: {
      comunidade: {
        nome: "DEVPIRA - Piracicaba", descricao: comunidade.descricao,
        cidade: comunidade.cidade, contato: comunidade.contato, logo_url: ""
      }
    }

    assert_redirected_to comunidade_path(comunidade)
    assert_equal "DEVPIRA - Piracicaba", comunidade.reload.nome
  end

  test "membro sem ser organizador é redirecionado com erro" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    membro = make_user
    add_membro(comunidade, membro)
    sign_in(membro)

    get edit_comunidade_path(comunidade)

    assert_redirected_to comunidade_path(comunidade)
  end

  test "excluir GET retorna página de confirmação" do
    organizador = make_user
    comunidade = make_comunidade(organizador, nome: "DevTest")
    sign_in(organizador)

    get confirm_delete_comunidade_path(comunidade)

    assert_response :ok
    assert_match "Confirmar exclusão", response.body
  end

  test "excluir POST exclui e redireciona" do
    organizador = make_user
    comunidade = make_comunidade(organizador, nome: "DevTest")
    sign_in(organizador)

    delete confirm_delete_comunidade_path(comunidade)

    assert_redirected_to comunidades_path
    assert_not Comunidade.exists?(id: comunidade.id)
  end

  test "excluir com evento futuro não exclui" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    make_evento(comunidade, organizador, data: Date.current + 5)
    sign_in(organizador)

    delete confirm_delete_comunidade_path(comunidade)

    assert_redirected_to comunidade_path(comunidade)
    assert Comunidade.exists?(id: comunidade.id)
  end

  test "excluir sem ser organizador é redirecionado" do
    organizador = make_user
    comunidade = make_comunidade(organizador, nome: "DevTest")
    outro = make_user
    sign_in(outro)

    delete confirm_delete_comunidade_path(comunidade)

    assert_redirected_to comunidade_path(comunidade)
    assert Comunidade.exists?(id: comunidade.id)
  end
end
