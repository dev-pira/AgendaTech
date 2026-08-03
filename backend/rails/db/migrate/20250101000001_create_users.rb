class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users, id: :string, limit: 36 do |t|
      t.string :username, null: false
      t.string :email, null: false
      t.string :first_name, null: false, default: ""
      t.string :last_name, null: false, default: ""
      t.string :password_digest, null: false

      t.timestamps
    end

    add_index :users, :username, unique: true
    add_index :users, :email, unique: true
  end
end
