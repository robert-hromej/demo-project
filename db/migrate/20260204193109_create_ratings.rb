# frozen_string_literal: true

class CreateRatings < ActiveRecord::Migration[8.1]
  def change
    create_table :ratings do |t|
      t.references :recipe, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :score, null: false
      t.text :review

      t.timestamps
    end

    add_index :ratings, %i[recipe_id user_id], unique: true
    add_index :ratings, :score
  end
end
