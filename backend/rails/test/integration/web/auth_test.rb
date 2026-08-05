require "test_helper"

class AuthTest < ActionDispatch::IntegrationTest
  def payload_cadastro(overrides = {})
    {
      user: {
        username: "novousuario",
        email: "novo@example.com",
        first_name: "Nova",
        last_name: "Usuária",
        password: "SenhaForte123!",
        password_confirmation: "SenhaForte123!"
      }.merge(overrides)
    }
  end

  test "cadastro GET retorna 200" do
    get cadastro_path
    assert_response :ok
  end

  test "cadastro POST válido cria usuário e loga" do
    post cadastro_path, params: payload_cadastro

    assert User.exists?(username: "novousuario")
    assert_redirected_to comunidades_path
    follow_redirect!
    assert_response :ok
  end

  test "cadastro com senhas diferentes não cria usuário" do
    post cadastro_path, params: payload_cadastro(password_confirmation: "OutraSenha456!")

    assert_not User.exists?(username: "novousuario")
  end

  test "cadastro com usuário já autenticado é redirecionado" do
    user = make_user
    sign_in(user)

    get cadastro_path

    assert_redirected_to comunidades_path
  end

  test "login GET retorna 200" do
    get login_path
    assert_response :ok
  end

  test "login com credenciais válidas autentica" do
    make_user(username: "joana", password: "SenhaForte123!")

    post login_path, params: { username: "joana", password: "SenhaForte123!" }

    assert_redirected_to comunidades_path
  end

  test "login com credenciais inválidas não autentica" do
    make_user(username: "joana", password: "SenhaForte123!")

    post login_path, params: { username: "joana", password: "errada" }

    assert_response :unprocessable_content
  end

  test "logout desautentica o usuário" do
    user = make_user
    sign_in(user)

    delete logout_path

    assert_redirected_to login_path

    get "/comunidades/nova"
    assert_redirected_to login_path
  end
end
