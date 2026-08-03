require "test_helper"

class EventosTest < ActionDispatch::IntegrationTest
  def payload_evento(comunidade_id, overrides = {})
    {
      evento: {
        titulo: "Workshop Node.js",
        descricao: "Hands-on de criação de APIs REST com Express.",
        data: (Date.current + 15).to_s,
        hora_inicio: "14:00",
        hora_fim: "18:00",
        local: "Espaço Maker - Av. Principal, 500",
        tipo: "presencial",
        url_online: "",
        comunidade_id: comunidade_id
      }.merge(overrides)
    }
  end

  test "lista retorna 200 e lista eventos" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    make_evento(comunidade, organizador, titulo: "Meetup React Avançado")

    get eventos_path

    assert_response :ok
    assert_match "Meetup React Avançado", response.body
  end

  test "lista filtra por comunidade" do
    organizador = make_user
    comunidade_a = make_comunidade(organizador, nome: "Comunidade A")
    comunidade_b = make_comunidade(organizador, nome: "Comunidade B")
    make_evento(comunidade_a, organizador, titulo: "Evento A")
    make_evento(comunidade_b, organizador, titulo: "Evento B")

    get eventos_path, params: { comunidade: comunidade_a.id }

    assert_match "Evento A", response.body
    assert_no_match(/Evento B/, response.body)
  end

  test "lista sem resultados mostra mensagem vazia" do
    get eventos_path
    assert_match "Nenhum evento encontrado", response.body
  end

  test "detalhe retorna 200 com dados" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento = make_evento(comunidade, organizador, titulo: "Workshop Node.js")

    get evento_path(evento)

    assert_response :ok
    assert_match "Workshop Node.js", response.body
  end

  test "detalhe com id inexistente retorna 404" do
    get "/eventos/00000000-0000-0000-0000-000000000000"
    assert_response :not_found
  end

  test "botões de gestão ocultos para evento passado" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento_passado = make_evento(comunidade, organizador, data: Date.current - 1)
    sign_in(organizador)

    get evento_path(evento_passado)

    assert_no_match(/#{Regexp.escape(edit_evento_path(evento_passado))}/, response.body)
  end

  test "criar anônimo é redirecionado para login" do
    get new_evento_path
    assert_redirected_to login_path
  end

  test "criar usuário sem comunidade é redirecionado" do
    estranho = make_user
    sign_in(estranho)

    get new_evento_path

    assert_redirected_to comunidades_path
  end

  test "criar como membro funciona" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    membro = make_user
    add_membro(comunidade, membro)
    sign_in(membro)

    post new_evento_path, params: payload_evento(comunidade.id)

    evento = Evento.find_by!(titulo: "Workshop Node.js")
    assert_redirected_to evento_path(evento)
  end

  test "criar com data passada reexibe formulário com erro" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    sign_in(organizador)

    post new_evento_path, params: payload_evento(comunidade.id, data: (Date.current - 1).to_s)

    assert_response :unprocessable_content
    assert_match "futura", response.body
  end

  test "organizador atualiza com sucesso" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento = make_evento(comunidade, organizador, titulo: "Tech Talk")
    sign_in(organizador)

    put edit_evento_path(evento), params: {
      evento: {
        titulo: "Tech Talk - Edição Especial", descricao: evento.descricao, data: evento.data.to_s,
        hora_inicio: evento.hora_inicio.strftime("%H:%M"), hora_fim: "", local: evento.local,
        tipo: evento.tipo, url_online: ""
      }
    }

    assert_redirected_to evento_path(evento)
    assert_equal "Tech Talk - Edição Especial", evento.reload.titulo
  end

  test "membro sem ser organizador é redirecionado" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento = make_evento(comunidade, organizador, titulo: "Tech Talk")
    membro = make_user
    add_membro(comunidade, membro)
    sign_in(membro)

    get edit_evento_path(evento)

    assert_redirected_to evento_path(evento)
  end

  test "evento passado não pode ser editado" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento_passado = make_evento(comunidade, organizador, data: Date.current - 1)
    sign_in(organizador)

    get edit_evento_path(evento_passado)

    assert_redirected_to evento_path(evento_passado)
  end

  test "excluir GET retorna página de confirmação" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento = make_evento(comunidade, organizador, titulo: "Coding Dojo")
    sign_in(organizador)

    get confirm_delete_evento_path(evento)

    assert_response :ok
    assert_match "Confirmar exclusão", response.body
  end

  test "excluir POST exclui e redireciona" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento = make_evento(comunidade, organizador, titulo: "Coding Dojo")
    sign_in(organizador)

    delete confirm_delete_evento_path(evento)

    assert_redirected_to eventos_path
    assert_not Evento.exists?(id: evento.id)
  end

  test "evento passado não pode ser excluído" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento_passado = make_evento(comunidade, organizador, data: Date.current - 1)
    sign_in(organizador)

    delete confirm_delete_evento_path(evento_passado)

    assert_redirected_to evento_path(evento_passado)
    assert Evento.exists?(id: evento_passado.id)
  end

  test "excluir sem ser organizador é redirecionado" do
    organizador = make_user
    comunidade = make_comunidade(organizador)
    evento = make_evento(comunidade, organizador, titulo: "Coding Dojo")
    outro = make_user
    sign_in(outro)

    delete confirm_delete_evento_path(evento)

    assert_redirected_to evento_path(evento)
    assert Evento.exists?(id: evento.id)
  end
end
