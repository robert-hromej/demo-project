# frozen_string_literal: true

class CreateCategories < ActiveRecord::Migration[8.1]
  def change
    create_table :categories do |t|
      t.string :name, null: false, limit: 100
      t.text :description
      t.string :image_url, limit: 500
      t.string :ancestry
      t.integer :position, default: 0

      t.timestamps
    end

    add_index :categories, :ancestry
    add_index :categories, :position
  end
end
