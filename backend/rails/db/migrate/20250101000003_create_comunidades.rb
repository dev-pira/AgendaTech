class CreateComunidades < ActiveRecord::Migration[7.1]
  def change
    create_table :comunidades, id: :string, limit: 36 do |t|
      t.string :nome, null: false, limit: 100
      t.text :descricao, null: false
      t.string :cidade, null: false, limit: 100
      t.string :contato, null: false, limit: 255
      t.string :logo_url, null: false, limit: 500, default: ""
      t.references :criado_por, null: false, type: :string, limit: 36, foreign_key: { to_table: :users }

      t.timestamps
    end

    # RN-COM-02: nome único, sem diferenciar maiúsculas/minúsculas — o
    # collation padrão utf8mb4 do MySQL já compara strings ignorando caixa,
    # então um índice único "normal" já cobre a regra.
    add_index :comunidades, :nome, unique: true
  end
end
