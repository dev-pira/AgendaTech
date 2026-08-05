class CreateTokens < ActiveRecord::Migration[7.1]
  def change
    create_table :tokens do |t|
      t.references :user, null: false, type: :string, limit: 36, foreign_key: true, index: { unique: true }
      t.string :key, null: false, limit: 64
      t.datetime :created_at, null: false
    end

    add_index :tokens, :key, unique: true
  end
end
