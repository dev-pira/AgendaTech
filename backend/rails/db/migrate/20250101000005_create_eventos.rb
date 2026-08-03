class CreateEventos < ActiveRecord::Migration[7.1]
  def change
    create_table :eventos, id: :string, limit: 36 do |t|
      t.string :titulo, null: false, limit: 200
      t.text :descricao, null: false
      t.date :data, null: false
      t.time :hora_inicio, null: false
      t.time :hora_fim
      t.string :local, null: false, limit: 300
      t.string :tipo, null: false, limit: 20
      t.string :url_online, null: false, limit: 500, default: ""
      t.references :comunidade, null: false, type: :string, limit: 36, foreign_key: true
      t.references :organizador, null: false, type: :string, limit: 36, foreign_key: { to_table: :users }

      t.timestamps
    end

    # RN-EVT-09: não pode haver dois eventos com o mesmo título e data na
    # mesma comunidade.
    add_index :eventos, %i[comunidade_id titulo data], unique: true, name: "unique_evento_titulo_data_por_comunidade"
  end
end
