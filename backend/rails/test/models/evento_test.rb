require "test_helper"

class EventoTest < ActiveSupport::TestCase
  setup do
    @organizador = make_user
    @comunidade = make_comunidade(@organizador)
  end

  test "created" do
    make_evento(@comunidade, @organizador, titulo: "Meetup React")
    assert Evento.exists?(titulo: "Meetup React")
  end

  test "título muito curto é inválido" do
    assert_raises(ActiveRecord::RecordInvalid) do
      make_evento(@comunidade, @organizador, titulo: "Oi")
    end
  end

  test "descrição muito curta é inválida" do
    assert_raises(ActiveRecord::RecordInvalid) do
      make_evento(@comunidade, @organizador, descricao: "curta demais")
    end
  end

  test "hora_fim antes de hora_inicio é inválido" do
    assert_raises(ActiveRecord::RecordInvalid) do
      make_evento(@comunidade, @organizador, hora_inicio: "19:00", hora_fim: "18:00")
    end
  end

  test "hora_fim após hora_inicio é aceito" do
    evento = make_evento(@comunidade, @organizador, hora_inicio: "19:00", hora_fim: "21:00")
    assert_equal "21:00", evento.hora_fim.strftime("%H:%M")
  end

  test "tipo online sem url é inválido" do
    assert_raises(ActiveRecord::RecordInvalid) do
      make_evento(@comunidade, @organizador, tipo: Evento::ONLINE, url_online: "")
    end
  end

  test "tipo online com url é aceito" do
    evento = make_evento(
      @comunidade, @organizador, tipo: Evento::ONLINE, url_online: "https://meet.example.com/sala"
    )
    assert_equal "online", evento.tipo
  end

  test "evento duplicado na mesma comunidade/título/data é inválido" do
    data = Date.current + 10
    make_evento(@comunidade, @organizador, titulo: "Workshop Node.js", data: data)
    assert_raises(ActiveRecord::RecordInvalid) do
      make_evento(@comunidade, @organizador, titulo: "Workshop Node.js", data: data)
    end
  end
end
