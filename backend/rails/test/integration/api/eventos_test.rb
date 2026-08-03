require "test_helper"

class Api::EventosTest < ActionDispatch::IntegrationTest
  test "listar retorna 200 com envelope de paginação" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    make_evento(comunidade, organizador)

    get "/api/eventos"

    assert_response :ok
    body = response.parsed_body
    assert_equal 1, body["dados"].length
    assert_equal 1, body["paginacao"]["total_itens"]
  end

  test "listar filtra por comunidade" do
    organizador = make_user
    comunidade_a = make_comunidade(organizador, nome: "Comunidade A")
    comunidade_b = make_comunidade(organizador, nome: "Comunidade B")
    make_evento(comunidade_a, organizador, titulo: "Evento da comunidade A")
    make_evento(comunidade_b, organizador, titulo: "Evento da comunidade B")

    get "/api/eventos", params: { comunidade_id: comunidade_a.id }

    body = response.parsed_body
    assert_equal 1, body["dados"].length
    assert_equal "Evento da comunidade A", body["dados"].first["titulo"]
  end

  test "listar inclui comunidade e organizador aninhados" do
    organizador = make_user(username: "maria", first_name: "Maria", last_name: "Santos")
    comunidade = make_comunidade(organizador, nome: "DevLimeira")
    make_evento(comunidade, organizador)

    get "/api/eventos"

    item = response.parsed_body["dados"].first
    assert_equal "DevLimeira", item["comunidade"]["nome"]
    assert_equal "Maria Santos", item["organizador"]["nome"]
  end

  test "obter retorna 200" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento = make_evento(comunidade, organizador, titulo: "Meetup React Avançado")

    get "/api/eventos/#{evento.id}"

    assert_response :ok
    assert_equal "Meetup React Avançado", response.parsed_body["titulo"]
  end

  test "obter com id inexistente retorna 404" do
    get "/api/eventos/00000000-0000-0000-0000-000000000000"

    assert_response :not_found
  end

  test "criar sem autenticação retorna 401" do
    organizador = make_user
    comunidade = make_comunidade(organizador)

    post "/api/eventos", params: payload_evento(comunidade.id), as: :json

    assert_response :unauthorized
  end

  test "criar como membro funciona" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    membro = make_user
    add_membro(comunidade, membro)

    post "/api/eventos", params: payload_evento(comunidade.id), headers: auth_header(membro), as: :json

    assert_response :created
    assert Evento.exists?(titulo: "Workshop Node.js")
  end

  test "criar sem ser membro recebe 403" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    estranho = make_user

    post "/api/eventos", params: payload_evento(comunidade.id), headers: auth_header(estranho), as: :json

    assert_response :forbidden
  end

  test "criar com data passada retorna 400" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    payload = payload_evento(comunidade.id, data: (Date.current - 1).to_s)

    post "/api/eventos", params: payload, headers: auth_header(organizador), as: :json

    assert_response :bad_request
  end

  test "criar evento duplicado retorna 409" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    payload = payload_evento(comunidade.id)

    post "/api/eventos", params: payload, headers: auth_header(organizador), as: :json
    post "/api/eventos", params: payload, headers: auth_header(organizador), as: :json

    assert_response :conflict
  end

  test "criar tipo online sem url retorna 400" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    payload = payload_evento(comunidade.id, tipo: "online", titulo: "Live Online")

    post "/api/eventos", params: payload, headers: auth_header(organizador), as: :json

    assert_response :bad_request
  end

  test "atualizar como organizador funciona" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento = make_evento(comunidade, organizador, titulo: "Tech Talk")

    put "/api/eventos/#{evento.id}", params: { titulo: "Tech Talk - Edição Especial" },
                                      headers: auth_header(organizador), as: :json

    assert_response :ok
    assert_equal "Tech Talk - Edição Especial", evento.reload.titulo
  end

  test "atualizar como membro sem ser organizador recebe 403" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento = make_evento(comunidade, organizador, titulo: "Tech Talk")
    membro = make_user
    add_membro(comunidade, membro)

    put "/api/eventos/#{evento.id}", params: { titulo: "Outro título" }, headers: auth_header(membro), as: :json

    assert_response :forbidden
  end

  test "atualizar evento passado não pode ser editado" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento_passado = make_evento(comunidade, organizador, data: Date.current - 1)

    put "/api/eventos/#{evento_passado.id}", params: { titulo: "Tentativa de edição" },
                                              headers: auth_header(organizador), as: :json

    assert_response :bad_request
  end

  test "excluir como organizador funciona" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento = make_evento(comunidade, organizador, titulo: "Coding Dojo")

    delete "/api/eventos/#{evento.id}", headers: auth_header(organizador)

    assert_response :no_content
    assert_not Evento.exists?(id: evento.id)
  end

  test "excluir evento passado não pode ser excluído" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento_passado = make_evento(comunidade, organizador, data: Date.current - 1)

    delete "/api/eventos/#{evento_passado.id}", headers: auth_header(organizador)

    assert_response :bad_request
  end

  test "excluir sem ser organizador recebe 403" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento = make_evento(comunidade, organizador, titulo: "Coding Dojo")
    outro = make_user

    delete "/api/eventos/#{evento.id}", headers: auth_header(outro)

    assert_response :forbidden
  end

  private

  def payload_evento(comunidade_id, overrides = {})
    {
      titulo: "Workshop Node.js",
      descricao: "Hands-on de criação de APIs REST com Express.",
      data: (Date.current + 15).to_s,
      hora_inicio: "14:00:00",
      hora_fim: "18:00:00",
      local: "Espaço Maker - Av. Principal, 500",
      tipo: "presencial",
      comunidade_id: comunidade_id
    }.merge(overrides)
  end
end
