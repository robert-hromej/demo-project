# frozen_string_literal: true

class CreateIngredients < ActiveRecord::Migration[8.1]
  def change
    create_table :ingredients do |t|
      t.string :name, null: false, limit: 100
      t.string :name_uk, null: false, limit: 100
      t.integer :unit_price_cents, default: 0
      t.string :default_unit, limit: 20, default: "pcs"
      t.string :category, limit: 50
      t.string :image_url, limit: 500

      t.timestamps
    end

    add_index :ingredients, :name, unique: true
    add_index :ingredients, :name_uk
    add_index :ingredients, :category
  end
end
