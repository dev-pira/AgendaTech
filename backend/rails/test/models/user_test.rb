require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "nome_exibicao usa first_name + last_name quando presentes" do
    user = make_user(first_name: "Maria", last_name: "Santos")
    assert_equal "Maria Santos", user.nome_exibicao
  end

  test "nome_exibicao cai para username quando não há nome" do
    user = make_user(first_name: "", last_name: "")
    assert_equal user.username, user.nome_exibicao
  end

  test "authenticate retorna false para senha errada" do
    user = make_user(password: "SenhaCorreta123")
    assert_not user.authenticate("SenhaErrada")
  end

  test "authenticate retorna o usuário para senha correta" do
    user = make_user(password: "SenhaCorreta123")
    assert_equal user, user.authenticate("SenhaCorreta123")
  end

  test "username duplicado é inválido" do
    make_user(username: "joao")
    assert_raises(ActiveRecord::RecordInvalid) do
      User.create!(username: "joao", email: "outro@example.com", password: "StrongPass123!")
    end
  end
end
