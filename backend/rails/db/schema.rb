# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_01_01_000005) do
  create_table "comunidade_membros", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "comunidade_id", limit: 36, null: false
    t.string "usuario_id", limit: 36, null: false
    t.string "papel", default: "membro", null: false
    t.datetime "adicionado_em", null: false
    t.string "adicionado_por_id", limit: 36
    t.index ["adicionado_por_id"], name: "index_comunidade_membros_on_adicionado_por_id"
    t.index ["comunidade_id", "usuario_id"], name: "unique_membro_por_comunidade", unique: true
    t.index ["comunidade_id"], name: "index_comunidade_membros_on_comunidade_id"
    t.index ["usuario_id"], name: "index_comunidade_membros_on_usuario_id"
  end

  create_table "comunidades", id: { type: :string, limit: 36 }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "nome", limit: 100, null: false
    t.text "descricao", null: false
    t.string "cidade", limit: 100, null: false
    t.string "contato", null: false
    t.string "logo_url", limit: 500, default: "", null: false
    t.string "criado_por_id", limit: 36, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["criado_por_id"], name: "index_comunidades_on_criado_por_id"
    t.index ["nome"], name: "index_comunidades_on_nome", unique: true
  end

  create_table "eventos", id: { type: :string, limit: 36 }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "titulo", limit: 200, null: false
    t.text "descricao", null: false
    t.date "data", null: false
    t.time "hora_inicio", null: false
    t.time "hora_fim"
    t.string "local", limit: 300, null: false
    t.string "tipo", limit: 20, null: false
    t.string "url_online", limit: 500, default: "", null: false
    t.string "comunidade_id", limit: 36, null: false
    t.string "organizador_id", limit: 36, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["comunidade_id", "titulo", "data"], name: "unique_evento_titulo_data_por_comunidade", unique: true
    t.index ["comunidade_id"], name: "index_eventos_on_comunidade_id"
    t.index ["organizador_id"], name: "index_eventos_on_organizador_id"
  end

  create_table "tokens", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "user_id", limit: 36, null: false
    t.string "key", limit: 64, null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_tokens_on_key", unique: true
    t.index ["user_id"], name: "index_tokens_on_user_id", unique: true
  end

  create_table "users", id: { type: :string, limit: 36 }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "username", null: false
    t.string "email", null: false
    t.string "first_name", default: "", null: false
    t.string "last_name", default: "", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "comunidade_membros", "comunidades"
  add_foreign_key "comunidade_membros", "users", column: "adicionado_por_id"
  add_foreign_key "comunidade_membros", "users", column: "usuario_id"
  add_foreign_key "comunidades", "users", column: "criado_por_id"
  add_foreign_key "eventos", "comunidades"
  add_foreign_key "eventos", "users", column: "organizador_id"
  add_foreign_key "tokens", "users"
end
