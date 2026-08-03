require "test_helper"

class Api::ComunidadesTest < ActionDispatch::IntegrationTest
  test "listar retorna 200 com envelope de paginação" do
    organizador = make_user
    make_comunidade(organizador, nome: "DEVPIRA")
    make_comunidade(organizador, nome: "DevLimeira")

    get "/api/comunidades"

    assert_response :ok
    body = response.parsed_body
    assert_equal 2, body["dados"].length
    assert_equal 2, body["paginacao"]["total_itens"]
  end

  test "listar filtra por cidade" do
    organizador = make_user
    make_comunidade(organizador, nome: "DEVPIRA", cidade: "Piracicaba")
    make_comunidade(organizador, nome: "DevLimeira", cidade: "Limeira")

    get "/api/comunidades", params: { cidade: "Limeira" }

    body = response.parsed_body
    assert_equal 1, body["dados"].length
    assert_equal "DevLimeira", body["dados"].first["nome"]
  end

  test "listar com página negativa retorna 400" do
    get "/api/comunidades", params: { pagina: -1 }

    assert_response :bad_request
  end

  test "listar inclui total_membros na resposta" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    add_membro(comunidade, make_user)

    get "/api/comunidades"

    assert_equal 2, response.parsed_body["dados"].first["total_membros"]
  end

  test "obter retorna 200 com dados completos" do
    organizador = make_user
    comunidade = make_comunidade(organizador, nome: "DEVPIRA")

    get "/api/comunidades/#{comunidade.id}"

    assert_response :ok
    body = response.parsed_body
    assert_equal "DEVPIRA", body["nome"]
    assert_equal 1, body["membros"].length
    assert_equal "organizador", body["membros"].first["papel"]
  end

  test "obter com id inexistente retorna 404" do
    get "/api/comunidades/00000000-0000-0000-0000-000000000000"

    assert_response :not_found
  end

  test "criar sem autenticação retorna 401" do
    post "/api/comunidades", params: payload_comunidade, as: :json

    assert_response :unauthorized
  end

  test "criar com sucesso retorna 201" do
    organizador = make_user

    post "/api/comunidades", params: payload_comunidade, headers: auth_header(organizador), as: :json

    assert_response :created
    assert Comunidade.exists?(nome: "DevCity")
  end

  test "criador vira organizador automaticamente" do
    organizador = make_user

    post "/api/comunidades", params: payload_comunidade, headers: auth_header(organizador), as: :json

    assert_equal "organizador", response.parsed_body["membros"].first["papel"]
  end

  test "criar com nome ausente retorna 400 ou 422" do
    organizador = make_user
    payload = payload_comunidade.except(:nome)

    post "/api/comunidades", params: payload, headers: auth_header(organizador), as: :json

    assert_includes [400, 422], response.status
  end

  test "criar com nome duplicado retorna 409" do
    organizador = make_user
    make_comunidade(organizador, nome: "DevCity")

    post "/api/comunidades", params: payload_comunidade, headers: auth_header(organizador), as: :json

    assert_response :conflict
  end

  test "atualizar como organizador funciona" do
    organizador = make_user
    comunidade = make_comunidade(organizador, nome: "DEVPIRA")

    put "/api/comunidades/#{comunidade.id}", params: { nome: "DEVPIRA - Piracicaba" },
                                              headers: auth_header(organizador), as: :json

    assert_response :ok
    assert_equal "DEVPIRA - Piracicaba", comunidade.reload.nome
  end

  test "atualizar como membro sem ser organizador recebe 403" do
    organizador = make_user
    comunidade = make_comunidade(organizador, nome: "DEVPIRA")
    membro = make_user
    add_membro(comunidade, membro)

    put "/api/comunidades/#{comunidade.id}", params: { nome: "Outro nome" }, headers: auth_header(membro), as: :json

    assert_response :forbidden
  end

  test "atualizar comunidade inexistente retorna 404" do
    organizador = make_user

    put "/api/comunidades/00000000-0000-0000-0000-000000000000", params: { nome: "X" },
                                                                   headers: auth_header(organizador), as: :json

    assert_response :not_found
  end

  test "excluir como organizador funciona" do
    organizador = make_user
    comunidade = make_comunidade(organizador, nome: "DevTest")

    delete "/api/comunidades/#{comunidade.id}", headers: auth_header(organizador)

    assert_response :no_content
    assert_not Comunidade.exists?(id: comunidade.id)
  end

  test "excluir com evento futuro retorna 400" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    make_evento(comunidade, organizador, data: Date.current + 5)

    delete "/api/comunidades/#{comunidade.id}", headers: auth_header(organizador)

    assert_response :bad_request
    assert Comunidade.exists?(id: comunidade.id)
  end

  test "excluir sem ser organizador recebe 403" do
    organizador = make_user
    comunidade = make_comunidade(organizador, nome: "DevTest")
    outro = make_user

    delete "/api/comunidades/#{comunidade.id}", headers: auth_header(outro)

    assert_response :forbidden
  end

  private

  def payload_comunidade
    {
      nome: "DevCity",
      descricao: "Comunidade local de desenvolvedores.",
      cidade: "São Paulo",
      contato: "dev@city.com"
    }
  end
end
