class CreateComunidadeMembros < ActiveRecord::Migration[7.1]
  def change
    create_table :comunidade_membros do |t|
      t.references :comunidade, null: false, type: :string, limit: 36, foreign_key: true
      t.references :usuario, null: false, type: :string, limit: 36, foreign_key: { to_table: :users }
      t.string :papel, null: false, default: "membro"
      t.datetime :adicionado_em, null: false
      t.references :adicionado_por, null: true, type: :string, limit: 36, foreign_key: { to_table: :users }
    end

    add_index :comunidade_membros, %i[comunidade_id usuario_id], unique: true, name: "unique_membro_por_comunidade"
  end
end
