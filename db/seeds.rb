# frozen_string_literal: true

# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "Clearing database..."
Rating.destroy_all
RecipeIngredient.destroy_all
Recipe.destroy_all
Ingredient.destroy_all
Category.destroy_all
User.destroy_all

# ============================================================================
# Users
# ============================================================================
puts "Creating users..."
users = [
  User.create!(
    email: "admin@example.com",
    password: "password123",
    name: "Адміністратор"
  ),
  User.create!(
    email: "maria@example.com",
    password: "password123",
    name: "Марія Коваленко"
  ),
  User.create!(
    email: "ivan@example.com",
    password: "password123",
    name: "Іван Петренко"
  ),
  User.create!(
    email: "olena@example.com",
    password: "password123",
    name: "Олена Шевченко"
  ),
  User.create!(
    email: "taras@example.com",
    password: "password123",
    name: "Тарас Бондаренко"
  )
]
puts "  Created #{users.size} users"

# ============================================================================
# Categories (hierarchical structure)
# ============================================================================
puts "Creating categories..."

# Root categories
sniданki = Category.create!(name: "Сніданки", position: 1, description: "Страви для ранкового прийому їжі")
obidy = Category.create!(name: "Обіди", position: 2, description: "Основні страви дня")
vecheri = Category.create!(name: "Вечері", position: 3, description: "Страви для вечірнього прийому їжі")
deserty = Category.create!(name: "Десерти", position: 4, description: "Солодкі страви та випічка")
napoi = Category.create!(name: "Напої", position: 5, description: "Гарячі та холодні напої")

# Subcategories for Сніданки
Category.create!(name: "Каші", parent: sniданki, position: 1, description: "Різноманітні каші на воді та молоці")
stravi_z_yaets = Category.create!(name: "Страви з яєць", parent: sniданki, position: 2, description: "Омлети, яєчні та інші страви з яєць")

# Subcategories for Обіди
supy = Category.create!(name: "Супи", parent: obidy, position: 1, description: "Перші страви: борщі, супи, юшки")
drugi_stravy = Category.create!(name: "Другі страви", parent: obidy, position: 2, description: "Основні страви з м'ясом та гарнірами")

# Subcategories for Вечері
legki_stravy = Category.create!(name: "Легкі страви", parent: vecheri, position: 1, description: "Легкі страви для вечері")

puts "  Created #{Category.count} categories"

# ============================================================================
# Ingredients
# ============================================================================
puts "Creating ingredients..."

ingredients_data = [
  # Dairy - Молочні продукти
  { name: "milk", name_uk: "Молоко", category: "dairy", default_unit: "ml", unit_price_cents: 4500 },
  { name: "eggs", name_uk: "Яйця", category: "dairy", default_unit: "pcs", unit_price_cents: 800 },
  { name: "butter", name_uk: "Масло вершкове", category: "dairy", default_unit: "g", unit_price_cents: 50 },
  { name: "cottage_cheese", name_uk: "Сир кисломолочний", category: "dairy", default_unit: "g", unit_price_cents: 25 },
  { name: "sour_cream", name_uk: "Сметана", category: "dairy", default_unit: "g", unit_price_cents: 30 },
  { name: "hard_cheese", name_uk: "Сир твердий", category: "dairy", default_unit: "g", unit_price_cents: 60 },

  # Vegetables - Овочі
  { name: "potato", name_uk: "Картопля", category: "vegetables", default_unit: "g", unit_price_cents: 3 },
  { name: "carrot", name_uk: "Морква", category: "vegetables", default_unit: "g", unit_price_cents: 4 },
  { name: "onion", name_uk: "Цибуля", category: "vegetables", default_unit: "g", unit_price_cents: 3 },
  { name: "garlic", name_uk: "Часник", category: "vegetables", default_unit: "g", unit_price_cents: 15 },
  { name: "tomato", name_uk: "Помідори", category: "vegetables", default_unit: "g", unit_price_cents: 8 },
  { name: "cucumber", name_uk: "Огірки", category: "vegetables", default_unit: "g", unit_price_cents: 7 },
  { name: "cabbage", name_uk: "Капуста білокачанна", category: "vegetables", default_unit: "g", unit_price_cents: 2 },
  { name: "beetroot", name_uk: "Буряк", category: "vegetables", default_unit: "g", unit_price_cents: 3 },
  { name: "bell_pepper", name_uk: "Перець болгарський", category: "vegetables", default_unit: "g", unit_price_cents: 12 },
  { name: "green_peas", name_uk: "Горошок зелений", category: "vegetables", default_unit: "g", unit_price_cents: 8 },
  { name: "pickled_cucumber", name_uk: "Огірки мариновані", category: "vegetables", default_unit: "g", unit_price_cents: 10 },

  # Meat - М'ясо
  { name: "chicken_breast", name_uk: "Куряче філе", category: "meat", default_unit: "g", unit_price_cents: 25 },
  { name: "pork", name_uk: "Свинина", category: "meat", default_unit: "g", unit_price_cents: 22 },
  { name: "beef", name_uk: "Яловичина", category: "meat", default_unit: "g", unit_price_cents: 30 },
  { name: "sausage", name_uk: "Ковбаса варена", category: "meat", default_unit: "g", unit_price_cents: 18 },

  # Grains - Крупи та борошно
  { name: "flour", name_uk: "Борошно пшеничне", category: "grains", default_unit: "g", unit_price_cents: 3 },
  { name: "rice", name_uk: "Рис", category: "grains", default_unit: "g", unit_price_cents: 5 },
  { name: "buckwheat", name_uk: "Гречка", category: "grains", default_unit: "g", unit_price_cents: 6 },
  { name: "pasta", name_uk: "Макарони", category: "grains", default_unit: "g", unit_price_cents: 4 },
  { name: "bread", name_uk: "Хліб", category: "grains", default_unit: "g", unit_price_cents: 5 },
  { name: "oatmeal", name_uk: "Вівсяні пластівці", category: "grains", default_unit: "g", unit_price_cents: 4 },
  { name: "semolina", name_uk: "Манка", category: "grains", default_unit: "g", unit_price_cents: 3 },

  # Spices and other - Спеції та інше
  { name: "salt", name_uk: "Сіль", category: "spices", default_unit: "g", unit_price_cents: 1 },
  { name: "sugar", name_uk: "Цукор", category: "spices", default_unit: "g", unit_price_cents: 3 },
  { name: "black_pepper", name_uk: "Перець чорний", category: "spices", default_unit: "g", unit_price_cents: 50 },
  { name: "bay_leaf", name_uk: "Лавровий лист", category: "spices", default_unit: "pcs", unit_price_cents: 50 },
  { name: "dill", name_uk: "Кріп", category: "spices", default_unit: "g", unit_price_cents: 20 },
  { name: "parsley", name_uk: "Петрушка", category: "spices", default_unit: "g", unit_price_cents: 20 },

  # Oils - Олії
  { name: "sunflower_oil", name_uk: "Олія соняшникова", category: "oils", default_unit: "ml", unit_price_cents: 8 },
  { name: "vinegar", name_uk: "Оцет", category: "oils", default_unit: "ml", unit_price_cents: 5 },

  # Other - Інше
  { name: "mayonnaise", name_uk: "Майонез", category: "other", default_unit: "g", unit_price_cents: 12 },
  { name: "tomato_paste", name_uk: "Томатна паста", category: "other", default_unit: "g", unit_price_cents: 15 },
  { name: "baking_powder", name_uk: "Розпушувач", category: "other", default_unit: "g", unit_price_cents: 30 },
  { name: "vanilla_sugar", name_uk: "Цукор ванільний", category: "other", default_unit: "g", unit_price_cents: 100 }
]

ingredients = {}
ingredients_data.each do |data|
  ingredient = Ingredient.create!(data)
  ingredients[data[:name]] = ingredient
end

puts "  Created #{Ingredient.count} ingredients"

# ============================================================================
# Recipes
# ============================================================================
puts "Creating recipes..."

recipes_data = [
  # 1. Омлет з молоком
  {
    title: "Омлет з молоком",
    description: "Класичний пухкий омлет на молоці - ідеальний сніданок для всієї родини.",
    instructions: <<~INSTRUCTIONS,
      1. Розбийте яйця в глибоку миску.
      2. Додайте молоко, сіль та перець за смаком.
      3. Ретельно збийте суміш виделкою або віночком до однорідності.
      4. Розігрійте сковороду на середньому вогні, додайте шматочок масла.
      5. Коли масло розтопиться, вилийте яєчну суміш на сковороду.
      6. Накрийте кришкою та готуйте 5-7 хвилин на малому вогні.
      7. Омлет готовий, коли верх схопиться, а низ буде золотистим.
      8. Подавайте гарячим, за бажанням посипте зеленню.
    INSTRUCTIONS
    prep_time_min: 5,
    cook_time_min: 10,
    servings: 2,
    difficulty: :easy,
    category: stravi_z_yaets,
    ingredients_list: [
      { ingredient: "eggs", quantity: 4, unit: "pcs" },
      { ingredient: "milk", quantity: 100, unit: "ml" },
      { ingredient: "butter", quantity: 20, unit: "g" },
      { ingredient: "salt", quantity: 2, unit: "g" },
      { ingredient: "black_pepper", quantity: 1, unit: "g", optional: true }
    ]
  },

  # 2. Вівсяна каша
  {
    title: "Вівсяна каша на молоці",
    description: "Корисна та поживна вівсяна каша - чудовий початок дня.",
    instructions: <<~INSTRUCTIONS,
      1. Налийте молоко в каструлю та доведіть до кипіння.
      2. Додайте вівсяні пластівці, постійно помішуючи.
      3. Зменшіть вогонь та варіть 5-7 хвилин, періодично помішуючи.
      4. За 2 хвилини до готовності додайте сіль та цукор.
      5. Зніміть з вогню, накрийте кришкою і дайте настоятися 2-3 хвилини.
      6. Подавайте з шматочком масла зверху.
    INSTRUCTIONS
    prep_time_min: 2,
    cook_time_min: 10,
    servings: 2,
    difficulty: :easy,
    category: Category.find_by(name: "Каші"),
    ingredients_list: [
      { ingredient: "oatmeal", quantity: 100, unit: "g" },
      { ingredient: "milk", quantity: 400, unit: "ml" },
      { ingredient: "sugar", quantity: 20, unit: "g" },
      { ingredient: "salt", quantity: 2, unit: "g" },
      { ingredient: "butter", quantity: 15, unit: "g" }
    ]
  },

  # 3. Борщ український
  {
    title: "Борщ український класичний",
    description: "Традиційний український борщ з пампушками - символ української кухні.",
    instructions: <<~INSTRUCTIONS,
      1. Наріжте м'ясо шматочками та залийте холодною водою. Варіть бульйон 1-1.5 години, знімаючи піну.
      2. Наріжте буряк соломкою, збризніть оцтом і тушкуйте на сковороді з олією 15 хвилин.
      3. Наріжте картоплю кубиками та додайте в бульйон, варіть 10 хвилин.
      4. Нашаткуйте капусту та додайте до бульйону.
      5. Наріжте цибулю, моркву та обсмажте на олії до золотистого кольору.
      6. Додайте томатну пасту до зажарки та протушкуйте 3 хвилини.
      7. Додайте буряк та зажарку в каструлю.
      8. Посоліть, поперчіть, додайте лавровий лист та часник.
      9. Варіть ще 10-15 хвилин на малому вогні.
      10. Дайте борщу настоятися 30 хвилин перед подачею.
      11. Подавайте зі сметаною та свіжою зеленню.
    INSTRUCTIONS
    prep_time_min: 30,
    cook_time_min: 120,
    servings: 8,
    difficulty: :medium,
    category: supy,
    ingredients_list: [
      { ingredient: "beef", quantity: 500, unit: "g" },
      { ingredient: "beetroot", quantity: 300, unit: "g" },
      { ingredient: "cabbage", quantity: 300, unit: "g" },
      { ingredient: "potato", quantity: 400, unit: "g" },
      { ingredient: "carrot", quantity: 150, unit: "g" },
      { ingredient: "onion", quantity: 150, unit: "g" },
      { ingredient: "tomato_paste", quantity: 50, unit: "g" },
      { ingredient: "garlic", quantity: 15, unit: "g" },
      { ingredient: "sunflower_oil", quantity: 50, unit: "ml" },
      { ingredient: "vinegar", quantity: 15, unit: "ml" },
      { ingredient: "salt", quantity: 15, unit: "g" },
      { ingredient: "black_pepper", quantity: 3, unit: "g" },
      { ingredient: "bay_leaf", quantity: 2, unit: "pcs" },
      { ingredient: "sour_cream", quantity: 100, unit: "g", notes: "для подачі" },
      { ingredient: "dill", quantity: 20, unit: "g", notes: "для подачі" }
    ]
  },

  # 4. Вареники з картоплею
  {
    title: "Вареники з картоплею",
    description: "Домашні вареники з картопляною начинкою - улюблена українська страва.",
    instructions: <<~INSTRUCTIONS,
      1. Просійте борошно в миску, зробіть заглибину.
      2. Влийте теплу воду з сіллю та замісіть еластичне тісто.
      3. Накрийте тісто плівкою і дайте відпочити 30 хвилин.
      4. Зваріть картоплю в підсоленій воді до готовності.
      5. Обсмажте нарізану цибулю на олії до золотистого кольору.
      6. Зробіть картопляне пюре, додайте половину смаженої цибулі, посоліть.
      7. Розкачайте тісто, виріжте кола склянкою.
      8. На кожне коло покладіть чайну ложку начинки.
      9. Защипніть краї, формуючи вареники.
      10. Варіть у підсоленій воді 3-5 хвилин після спливання.
      11. Подавайте з рештою смаженої цибулі та сметаною.
    INSTRUCTIONS
    prep_time_min: 60,
    cook_time_min: 30,
    servings: 6,
    difficulty: :hard,
    category: drugi_stravy,
    ingredients_list: [
      { ingredient: "flour", quantity: 400, unit: "g" },
      { ingredient: "potato", quantity: 700, unit: "g" },
      { ingredient: "onion", quantity: 200, unit: "g" },
      { ingredient: "sunflower_oil", quantity: 50, unit: "ml" },
      { ingredient: "salt", quantity: 10, unit: "g" },
      { ingredient: "sour_cream", quantity: 150, unit: "g", notes: "для подачі" }
    ]
  },

  # 5. Котлети по-київськи
  {
    title: "Котлети по-київськи",
    description: "Знамениті котлети з курячого філе з вершковим маслом всередині.",
    instructions: <<~INSTRUCTIONS,
      1. Підготуйте вершкове масло: сформуйте з нього невеликі батончики та покладіть у морозилку.
      2. Куряче філе розріжте вздовж, не дорізаючи до кінця.
      3. Відбийте м'ясо між плівкою до товщини 5 мм.
      4. Посоліть та поперчіть філе.
      5. Покладіть заморожене масло на край філе.
      6. Загорніть м'ясо рулетом, ретельно защипнувши краї.
      7. Підготуйте три миски: з борошном, збитим яйцем та паніровкою.
      8. Обваляйте котлети спочатку в борошні, потім у яйці, потім у паніровці.
      9. Повторіть панірування в яйці та паніровці для надійності.
      10. Обсмажте котлети у великій кількості олії до золотистої скоринки.
      11. Доведіть до готовності в духовці при 180 градусах протягом 15-20 хвилин.
    INSTRUCTIONS
    prep_time_min: 45,
    cook_time_min: 30,
    servings: 4,
    difficulty: :medium,
    category: legki_stravy,
    ingredients_list: [
      { ingredient: "chicken_breast", quantity: 600, unit: "g" },
      { ingredient: "butter", quantity: 100, unit: "g" },
      { ingredient: "eggs", quantity: 2, unit: "pcs" },
      { ingredient: "flour", quantity: 100, unit: "g" },
      { ingredient: "bread", quantity: 100, unit: "g", notes: "панірувальні сухарі" },
      { ingredient: "sunflower_oil", quantity: 200, unit: "ml" },
      { ingredient: "salt", quantity: 5, unit: "g" },
      { ingredient: "black_pepper", quantity: 2, unit: "g" }
    ]
  },

  # 6. Млинці
  {
    title: "Млинці на молоці",
    description: "Тонкі мереживні млинці - універсальна страва для сніданку.",
    instructions: <<~INSTRUCTIONS,
      1. Збийте яйця з цукром та сіллю до піни.
      2. Додайте половину молока та перемішайте.
      3. Всипте просіяне борошно та ретельно розмішайте, щоб не було грудочок.
      4. Влийте решту молока та рослинну олію.
      5. Перемішайте до однорідної консистенції рідкої сметани.
      6. Дайте тісту відпочити 15-20 хвилин.
      7. Розігрійте сковороду та злегка змастіть олією.
      8. Налийте тісто тонким шаром, обертаючи сковороду.
      9. Смажте до золотистого кольору з обох боків.
      10. Подавайте зі сметаною, варенням або начинкою на вибір.
    INSTRUCTIONS
    prep_time_min: 15,
    cook_time_min: 30,
    servings: 6,
    difficulty: :easy,
    category: stravi_z_yaets,
    ingredients_list: [
      { ingredient: "flour", quantity: 200, unit: "g" },
      { ingredient: "milk", quantity: 500, unit: "ml" },
      { ingredient: "eggs", quantity: 3, unit: "pcs" },
      { ingredient: "sugar", quantity: 30, unit: "g" },
      { ingredient: "salt", quantity: 3, unit: "g" },
      { ingredient: "sunflower_oil", quantity: 30, unit: "ml" }
    ]
  },

  # 7. Сирники
  {
    title: "Сирники з сиру",
    description: "Ніжні сирники з кисломолочного сиру - класика української кухні.",
    instructions: <<~INSTRUCTIONS,
      1. Перетріть сир через сито або розімніть виделкою до однорідності.
      2. Додайте яйця, цукор та ванільний цукор. Перемішайте.
      3. Всипте борошно та розпушувач. Замісіть тісто.
      4. Тісто має бути м'яким, але тримати форму.
      5. Посипте робочу поверхню борошном.
      6. Сформуйте з тіста ковбаску та наріжте на шайби товщиною 1.5-2 см.
      7. Злегка приплюсніть кожен шматочок та обваляйте в борошні.
      8. Розігрійте сковороду з олією на середньому вогні.
      9. Обсмажте сирники до золотистої скоринки з обох боків (по 3-4 хвилини).
      10. Подавайте теплими зі сметаною або варенням.
    INSTRUCTIONS
    prep_time_min: 15,
    cook_time_min: 15,
    servings: 4,
    difficulty: :easy,
    category: stravi_z_yaets,
    ingredients_list: [
      { ingredient: "cottage_cheese", quantity: 500, unit: "g" },
      { ingredient: "eggs", quantity: 2, unit: "pcs" },
      { ingredient: "flour", quantity: 80, unit: "g" },
      { ingredient: "sugar", quantity: 50, unit: "g" },
      { ingredient: "vanilla_sugar", quantity: 10, unit: "g" },
      { ingredient: "baking_powder", quantity: 5, unit: "g" },
      { ingredient: "sunflower_oil", quantity: 50, unit: "ml" },
      { ingredient: "sour_cream", quantity: 100, unit: "g", notes: "для подачі" }
    ]
  },

  # 8. Салат Олів'є
  {
    title: "Салат Олів'є",
    description: "Святковий салат Олів'є - незмінний атрибут українського застілля.",
    instructions: <<~INSTRUCTIONS,
      1. Зваріть картоплю, моркву та яйця до готовності. Охолодіть.
      2. Зваріть ковбасу, якщо потрібно. Охолодіть.
      3. Наріжте картоплю, моркву, яйця та ковбасу дрібними кубиками.
      4. Наріжте мариновані огірки дрібними кубиками.
      5. Зваріть та охолодіть зелений горошок (або використовуйте консервований).
      6. Складіть усі інгредієнти в глибоку миску.
      7. Посоліть та поперчіть за смаком.
      8. Заправте майонезом та ретельно перемішайте.
      9. Поставте в холодильник на 30 хвилин, щоб салат просякся.
      10. Прикрасьте зеленню перед подачею.
    INSTRUCTIONS
    prep_time_min: 30,
    cook_time_min: 40,
    servings: 6,
    difficulty: :easy,
    category: legki_stravy,
    ingredients_list: [
      { ingredient: "potato", quantity: 400, unit: "g" },
      { ingredient: "carrot", quantity: 200, unit: "g" },
      { ingredient: "eggs", quantity: 4, unit: "pcs" },
      { ingredient: "sausage", quantity: 300, unit: "g" },
      { ingredient: "pickled_cucumber", quantity: 200, unit: "g" },
      { ingredient: "green_peas", quantity: 200, unit: "g" },
      { ingredient: "mayonnaise", quantity: 200, unit: "g" },
      { ingredient: "salt", quantity: 5, unit: "g" },
      { ingredient: "black_pepper", quantity: 2, unit: "g", optional: true },
      { ingredient: "dill", quantity: 10, unit: "g", notes: "для прикраси" }
    ]
  },

  # 9. Деруни
  {
    title: "Деруни картопляні",
    description: "Хрусткі картопляні деруни - традиційна українська страва.",
    instructions: <<~INSTRUCTIONS,
      1. Очистіть картоплю та натріть на дрібній тертці.
      2. Злийте зайвий сік з натертої картоплі.
      3. Натріть цибулю на дрібній тертці та додайте до картоплі.
      4. Вбийте яйце, посоліть та поперчіть.
      5. Додайте борошно та ретельно перемішайте.
      6. Розігрійте сковороду з великою кількістю олії.
      7. Викладайте тісто ложкою на сковороду, формуючи оладки.
      8. Обсмажте до золотистої скоринки з обох боків (по 3-4 хвилини).
      9. Викладіть на паперовий рушник, щоб зібрати зайвий жир.
      10. Подавайте гарячими зі сметаною.
    INSTRUCTIONS
    prep_time_min: 20,
    cook_time_min: 25,
    servings: 4,
    difficulty: :medium,
    category: drugi_stravy,
    ingredients_list: [
      { ingredient: "potato", quantity: 800, unit: "g" },
      { ingredient: "onion", quantity: 100, unit: "g" },
      { ingredient: "eggs", quantity: 1, unit: "pcs" },
      { ingredient: "flour", quantity: 50, unit: "g" },
      { ingredient: "salt", quantity: 8, unit: "g" },
      { ingredient: "black_pepper", quantity: 2, unit: "g" },
      { ingredient: "sunflower_oil", quantity: 150, unit: "ml" },
      { ingredient: "sour_cream", quantity: 150, unit: "g", notes: "для подачі" }
    ]
  },

  # 10. Запіканка сирна
  {
    title: "Запіканка сирна",
    description: "Ніжна сирна запіканка - корисний десерт для всієї родини.",
    instructions: <<~INSTRUCTIONS,
      1. Розігрійте духовку до 180 градусів.
      2. Перетріть сир через сито для пухкості.
      3. Відділіть жовтки від білків.
      4. Змішайте сир з жовтками, цукром та ванільним цукром.
      5. Додайте манку та сметану. Перемішайте.
      6. Дайте масі постояти 15 хвилин, щоб манка набухла.
      7. Збийте білки до стійких піків.
      8. Акуратно введіть білки в сиркову масу.
      9. Змастіть форму маслом та посипте манкою.
      10. Викладіть масу у форму та розрівняйте.
      11. Випікайте 40-45 хвилин до золотистої скоринки.
      12. Подавайте теплою або холодною зі сметаною.
    INSTRUCTIONS
    prep_time_min: 25,
    cook_time_min: 45,
    servings: 6,
    difficulty: :easy,
    category: deserty,
    ingredients_list: [
      { ingredient: "cottage_cheese", quantity: 500, unit: "g" },
      { ingredient: "eggs", quantity: 3, unit: "pcs" },
      { ingredient: "sugar", quantity: 100, unit: "g" },
      { ingredient: "vanilla_sugar", quantity: 10, unit: "g" },
      { ingredient: "semolina", quantity: 60, unit: "g" },
      { ingredient: "sour_cream", quantity: 100, unit: "g" },
      { ingredient: "butter", quantity: 20, unit: "g", notes: "для змащування форми" }
    ]
  },

  # 11. Гречана каша з грибами
  {
    title: "Гречана каша з цибулею",
    description: "Розсипчаста гречана каша з підсмаженою цибулею.",
    instructions: <<~INSTRUCTIONS,
      1. Промийте гречку під проточною водою.
      2. Прожарте гречку на сухій сковороді 3-4 хвилини для аромату.
      3. Переcипте гречку в каструлю, залийте водою у співвідношенні 1:2.
      4. Посоліть та доведіть до кипіння.
      5. Зменшіть вогонь та варіть під кришкою 15-20 хвилин.
      6. Поки каша варитися, наріжте цибулю півкільцями.
      7. Обсмажте цибулю на олії до золотистого кольору.
      8. Коли каша готова, додайте шматочок масла та дайте настоятися 5 хвилин.
      9. Подавайте кашу з підсмаженою цибулею зверху.
    INSTRUCTIONS
    prep_time_min: 10,
    cook_time_min: 25,
    servings: 4,
    difficulty: :easy,
    category: drugi_stravy,
    ingredients_list: [
      { ingredient: "buckwheat", quantity: 200, unit: "g" },
      { ingredient: "onion", quantity: 150, unit: "g" },
      { ingredient: "butter", quantity: 30, unit: "g" },
      { ingredient: "sunflower_oil", quantity: 30, unit: "ml" },
      { ingredient: "salt", quantity: 5, unit: "g" }
    ]
  },

  # 12. Яєчня з беконом
  {
    title: "Яєчня з цибулею та помідорами",
    description: "Проста та смачна яєчня - швидкий варіант сніданку.",
    instructions: <<~INSTRUCTIONS,
      1. Наріжте цибулю дрібними кубиками.
      2. Наріжте помідори кубиками середнього розміру.
      3. Розігрійте олію на сковороді.
      4. Обсмажте цибулю до прозорості.
      5. Додайте помідори та тушкуйте 3-4 хвилини.
      6. Вбийте яйця прямо на овочі.
      7. Посоліть та поперчіть.
      8. Накрийте кришкою та готуйте 4-5 хвилин на малому вогні.
      9. Посипте свіжою зеленню перед подачею.
    INSTRUCTIONS
    prep_time_min: 10,
    cook_time_min: 10,
    servings: 2,
    difficulty: :easy,
    category: stravi_z_yaets,
    ingredients_list: [
      { ingredient: "eggs", quantity: 4, unit: "pcs" },
      { ingredient: "onion", quantity: 80, unit: "g" },
      { ingredient: "tomato", quantity: 150, unit: "g" },
      { ingredient: "sunflower_oil", quantity: 20, unit: "ml" },
      { ingredient: "salt", quantity: 3, unit: "g" },
      { ingredient: "black_pepper", quantity: 1, unit: "g" },
      { ingredient: "parsley", quantity: 10, unit: "g", notes: "для подачі" }
    ]
  },

  # 13. Манна каша
  {
    title: "Манна каша на молоці",
    description: "Ніжна манна каша без грудочок - улюблений дитячий сніданок.",
    instructions: <<~INSTRUCTIONS,
      1. Налийте молоко в каструлю з товстим дном.
      2. Доведіть молоко до кипіння на середньому вогні.
      3. Зменшіть вогонь до мінімуму.
      4. Тонкою цівкою всипайте манку, постійно помішуючи.
      5. Важливо помішувати безперервно, щоб не утворилися грудочки.
      6. Варіть 5-7 хвилин, постійно помішуючи.
      7. Додайте сіль та цукор за смаком.
      8. Зніміть з вогню та додайте шматочок масла.
      9. Накрийте кришкою та дайте настоятися 3-5 хвилин.
      10. Подавайте теплою, за бажанням з варенням.
    INSTRUCTIONS
    prep_time_min: 5,
    cook_time_min: 12,
    servings: 2,
    difficulty: :easy,
    category: Category.find_by(name: "Каші"),
    ingredients_list: [
      { ingredient: "semolina", quantity: 60, unit: "g" },
      { ingredient: "milk", quantity: 400, unit: "ml" },
      { ingredient: "sugar", quantity: 25, unit: "g" },
      { ingredient: "salt", quantity: 2, unit: "g" },
      { ingredient: "butter", quantity: 20, unit: "g" }
    ]
  },

  # 14. Салат з капусти
  {
    title: "Салат з капусти та моркви",
    description: "Легкий вітамінний салат - ідеальний гарнір до м'ясних страв.",
    instructions: <<~INSTRUCTIONS,
      1. Нашаткуйте капусту тонкою соломкою.
      2. Посоліть капусту та злегка пом'яніть руками для м'якості.
      3. Натріть моркву на тертці для корейської моркви.
      4. Змішайте капусту та моркву в глибокій мисці.
      5. Додайте цукор та оцет, перемішайте.
      6. Полийте олією та перемішайте ще раз.
      7. Дайте салату настоятися 15-20 хвилин.
      8. Посипте свіжим кропом перед подачею.
    INSTRUCTIONS
    prep_time_min: 15,
    cook_time_min: 0,
    servings: 4,
    difficulty: :easy,
    category: legki_stravy,
    ingredients_list: [
      { ingredient: "cabbage", quantity: 400, unit: "g" },
      { ingredient: "carrot", quantity: 150, unit: "g" },
      { ingredient: "sunflower_oil", quantity: 40, unit: "ml" },
      { ingredient: "vinegar", quantity: 15, unit: "ml" },
      { ingredient: "sugar", quantity: 10, unit: "g" },
      { ingredient: "salt", quantity: 5, unit: "g" },
      { ingredient: "dill", quantity: 15, unit: "g" }
    ]
  },

  # 15. Пюре картопляне
  {
    title: "Картопляне пюре",
    description: "Класичне ніжне картопляне пюре - універсальний гарнір.",
    instructions: <<~INSTRUCTIONS,
      1. Очистіть картоплю та наріжте на середні шматки.
      2. Залийте холодною водою та поставте на вогонь.
      3. Посоліть воду після закипання.
      4. Варіть до повної готовності (20-25 хвилин).
      5. Підігрійте молоко в окремій каструлі.
      6. Злийте воду з картоплі.
      7. Розімніть картоплю товкачкою до однорідності.
      8. Додайте гаряче молоко та масло.
      9. Ретельно перемішайте до пухкої консистенції.
      10. За потреби досоліть за смаком.
    INSTRUCTIONS
    prep_time_min: 15,
    cook_time_min: 25,
    servings: 4,
    difficulty: :easy,
    category: drugi_stravy,
    ingredients_list: [
      { ingredient: "potato", quantity: 800, unit: "g" },
      { ingredient: "milk", quantity: 200, unit: "ml" },
      { ingredient: "butter", quantity: 50, unit: "g" },
      { ingredient: "salt", quantity: 8, unit: "g" }
    ]
  }
]

recipes = []
recipes_data.each do |data|
  ingredients_list = data.delete(:ingredients_list)

  recipe = Recipe.create!(data)
  recipes << recipe

  # Create recipe ingredients
  ingredients_list.each do |item|
    RecipeIngredient.create!(
      recipe: recipe,
      ingredient: ingredients[item[:ingredient]],
      quantity: item[:quantity],
      unit: item[:unit],
      optional: item[:optional] || false,
      notes: item[:notes]
    )
  end

  # Recalculate cost
  recipe.recalculate_cost!
end

puts "  Created #{Recipe.count} recipes with #{RecipeIngredient.count} recipe ingredients"

# ============================================================================
# Ratings
# ============================================================================
puts "Creating ratings..."

ratings_data = [
  # Омлет
  { recipe_index: 0, user_index: 1, score: 5, review: "Дуже смачний та пухкий омлет! Готую кожного ранку." },
  { recipe_index: 0, user_index: 2, score: 4, review: "Добрий рецепт, але я додаю трохи сиру." },
  { recipe_index: 0, user_index: 3, score: 5, review: "Ідеальний сніданок для всієї родини." },

  # Вівсяна каша
  { recipe_index: 1, user_index: 1, score: 4, review: "Корисно та смачно. Додаю ягоди." },
  { recipe_index: 1, user_index: 4, score: 5, review: "Найкращий рецепт вівсянки!" },

  # Борщ
  { recipe_index: 2, user_index: 0, score: 5, review: "Справжній український борщ! Як у бабусі." },
  { recipe_index: 2, user_index: 1, score: 5, review: "Чудовий рецепт, вся родина в захваті." },
  { recipe_index: 2, user_index: 2, score: 5, review: "Готую за цим рецептом вже рік. Завжди виходить ідеально." },
  { recipe_index: 2, user_index: 3, score: 4, review: "Дуже смачно, але трохи довго готувати." },
  { recipe_index: 2, user_index: 4, score: 5, review: "Найкращий борщ, який я коли-небудь їла!" },

  # Вареники
  { recipe_index: 3, user_index: 0, score: 5, review: "Домашні вареники - це щось неймовірне!" },
  { recipe_index: 3, user_index: 2, score: 4, review: "Смачно, але потрібна практика з тістом." },
  { recipe_index: 3, user_index: 3, score: 5, review: "Нарешті знайшла ідеальний рецепт!" },

  # Котлети по-київськи
  { recipe_index: 4, user_index: 1, score: 5, review: "Ресторанна якість вдома!" },
  { recipe_index: 4, user_index: 2, score: 4, review: "Дуже смачно, але треба бути обережним з маслом." },
  { recipe_index: 4, user_index: 4, score: 5, review: "Шедевр української кухні." },

  # Млинці
  { recipe_index: 5, user_index: 0, score: 5, review: "Тоненькі та мереживні, як я люблю." },
  { recipe_index: 5, user_index: 1, score: 4, review: "Хороший базовий рецепт." },
  { recipe_index: 5, user_index: 3, score: 5, review: "Діти просять готувати щовихідних!" },

  # Сирники
  { recipe_index: 6, user_index: 0, score: 5, review: "Пухкі та ніжні сирники." },
  { recipe_index: 6, user_index: 2, score: 5, review: "Найкращий рецепт сирників!" },
  { recipe_index: 6, user_index: 4, score: 4, review: "Смачно, але треба якісний сир." },

  # Олів'є
  { recipe_index: 7, user_index: 1, score: 5, review: "Класика! Без нього не обходиться жодне свято." },
  { recipe_index: 7, user_index: 2, score: 4, review: "Традиційний рецепт, як завжди смачно." },
  { recipe_index: 7, user_index: 3, score: 5, review: "Новорічний стіл без Олів'є - не стіл!" },

  # Деруни
  { recipe_index: 8, user_index: 0, score: 5, review: "Хрусткі та смачні деруни!" },
  { recipe_index: 8, user_index: 1, score: 5, review: "Нагадують дитинство." },
  { recipe_index: 8, user_index: 4, score: 4, review: "Дуже смачно зі сметаною." },

  # Запіканка
  { recipe_index: 9, user_index: 2, score: 5, review: "Чудовий десерт для дітей!" },
  { recipe_index: 9, user_index: 3, score: 4, review: "Смачно та корисно." },

  # Гречана каша
  { recipe_index: 10, user_index: 0, score: 4, review: "Проста та ситна страва." },
  { recipe_index: 10, user_index: 4, score: 5, review: "Смажена цибуля робить кашу особливою." },

  # Яєчня
  { recipe_index: 11, user_index: 1, score: 4, review: "Швидкий та смачний сніданок." },
  { recipe_index: 11, user_index: 3, score: 5, review: "Люблю з помідорами!" },

  # Манна каша
  { recipe_index: 12, user_index: 2, score: 5, review: "Без грудочок - ідеально!" },
  { recipe_index: 12, user_index: 4, score: 4, review: "Дітям дуже подобається." },

  # Салат з капусти
  { recipe_index: 13, user_index: 0, score: 4, review: "Легкий та освіжаючий салат." },
  { recipe_index: 13, user_index: 1, score: 5, review: "Ідеальний гарнір до м'яса." },

  # Пюре
  { recipe_index: 14, user_index: 2, score: 5, review: "Найкраще пюре - з гарячим молоком!" },
  { recipe_index: 14, user_index: 3, score: 5, review: "Класика, яка ніколи не набридає." }
]

ratings_data.each do |data|
  Rating.create!(
    recipe: recipes[data[:recipe_index]],
    user: users[data[:user_index]],
    score: data[:score],
    review: data[:review]
  )
end

puts "  Created #{Rating.count} ratings"

# ============================================================================
# Summary
# ============================================================================
puts "\n" + "=" * 60
puts "Seeding complete!"
puts "=" * 60
puts "Users:             #{User.count}"
puts "Categories:        #{Category.count} (#{Category.roots.count} root, #{Category.count - Category.roots.count} children)"
puts "Ingredients:       #{Ingredient.count}"
puts "Recipes:           #{Recipe.count}"
puts "Recipe Ingredients: #{RecipeIngredient.count}"
puts "Ratings:           #{Rating.count}"
puts "=" * 60
