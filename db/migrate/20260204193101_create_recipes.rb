# frozen_string_literal: true

class CreateRecipes < ActiveRecord::Migration[8.1]
  def change
    create_table :recipes do |t|
      t.references :category, foreign_key: true
      t.string :title, null: false, limit: 255
      t.text :description
      t.text :instructions, null: false
      t.integer :prep_time_min, null: false
      t.integer :cook_time_min, null: false
      t.integer :servings, null: false, default: 4
      t.integer :difficulty, null: false, default: 0
      t.string :image_url, limit: 500
      t.integer :est_cost_cents, default: 0
      t.decimal :avg_rating, precision: 3, scale: 2, default: 0
      t.integer :ratings_count, default: 0

      t.timestamps
    end

    add_index :recipes, :avg_rating
    add_index :recipes, :est_cost_cents
    add_index :recipes, :difficulty
  end
end
