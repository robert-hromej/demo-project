# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_02_04_193200) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "categories", force: :cascade do |t|
    t.string "ancestry"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "image_url", limit: 500
    t.string "name", limit: 100, null: false
    t.integer "position", default: 0
    t.integer "recipes_count", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["ancestry"], name: "index_categories_on_ancestry"
    t.index ["position"], name: "index_categories_on_position"
  end

  create_table "ingredients", force: :cascade do |t|
    t.string "category", limit: 50
    t.datetime "created_at", null: false
    t.string "default_unit", limit: 20, default: "pcs"
    t.string "image_url", limit: 500
    t.string "name", limit: 100, null: false
    t.string "name_uk", limit: 100, null: false
    t.integer "unit_price_cents", default: 0
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_ingredients_on_category"
    t.index ["name"], name: "index_ingredients_on_name", unique: true
    t.index ["name_uk"], name: "index_ingredients_on_name_uk"
  end

  create_table "ratings", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "recipe_id", null: false
    t.text "review"
    t.integer "score", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["recipe_id", "user_id"], name: "index_ratings_on_recipe_id_and_user_id", unique: true
    t.index ["recipe_id"], name: "index_ratings_on_recipe_id"
    t.index ["score"], name: "index_ratings_on_score"
    t.index ["user_id"], name: "index_ratings_on_user_id"
  end

  create_table "recipe_ingredients", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "ingredient_id", null: false
    t.string "notes", limit: 255
    t.boolean "optional", default: false
    t.decimal "quantity", precision: 10, scale: 3, null: false
    t.bigint "recipe_id", null: false
    t.string "unit", limit: 20, null: false
    t.datetime "updated_at", null: false
    t.index ["ingredient_id"], name: "index_recipe_ingredients_on_ingredient_id"
    t.index ["recipe_id", "ingredient_id"], name: "index_recipe_ingredients_on_recipe_id_and_ingredient_id", unique: true
    t.index ["recipe_id"], name: "index_recipe_ingredients_on_recipe_id"
  end

  create_table "recipes", force: :cascade do |t|
    t.decimal "avg_rating", precision: 3, scale: 2, default: "0.0"
    t.bigint "category_id"
    t.integer "cook_time_min", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "difficulty", default: 0, null: false
    t.integer "est_cost_cents", default: 0
    t.string "image_url", limit: 500
    t.text "instructions", null: false
    t.integer "prep_time_min", null: false
    t.integer "ratings_count", default: 0
    t.integer "servings", default: 4, null: false
    t.string "title", limit: 255, null: false
    t.datetime "updated_at", null: false
    t.index ["avg_rating"], name: "index_recipes_on_avg_rating"
    t.index ["category_id"], name: "index_recipes_on_category_id"
    t.index ["difficulty"], name: "index_recipes_on_difficulty"
    t.index ["est_cost_cents"], name: "index_recipes_on_est_cost_cents"
  end

  create_table "users", force: :cascade do |t|
    t.string "avatar_url", limit: 500
    t.datetime "created_at", null: false
    t.string "email", limit: 255, null: false
    t.string "name", limit: 100, null: false
    t.string "password_digest", limit: 255, null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "ratings", "recipes"
  add_foreign_key "ratings", "users"
  add_foreign_key "recipe_ingredients", "ingredients"
  add_foreign_key "recipe_ingredients", "recipes"
  add_foreign_key "recipes", "categories"
end
