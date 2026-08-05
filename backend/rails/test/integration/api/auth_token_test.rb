require "test_helper"

class Api::AuthTokenTest < ActionDispatch::IntegrationTest
  test "credenciais válidas retorna 200 com token" do
    make_user(username: "joao", password: "StrongPass123!")

    post "/api/auth/token", params: { username: "joao", password: "StrongPass123!" }, as: :json

    assert_response :ok
    assert response.parsed_body.key?("token")
  end

  test "token retornado é persistido" do
    user = make_user(username: "joao", password: "StrongPass123!")

    post "/api/auth/token", params: { username: "joao", password: "StrongPass123!" }, as: :json

    token = Token.find_by!(user: user)
    assert_equal token.key, response.parsed_body["token"]
  end

  test "senha inválida retorna 401" do
    make_user(username: "joao", password: "StrongPass123!")

    post "/api/auth/token", params: { username: "joao", password: "senha-errada" }, as: :json

    assert_response :unauthorized
  end
end
