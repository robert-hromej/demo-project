# frozen_string_literal: true

class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :email, null: false, limit: 255
      t.string :password_digest, null: false, limit: 255
      t.string :name, null: false, limit: 100
      t.string :avatar_url, limit: 500

      t.timestamps
    end

    add_index :users, :email, unique: true
  end
end
