// Habibi Bites Menu and Deals Dataset
// This file is loaded globally to ensure it works in double-click static file environments.

window.HABIBI_MENU = {
  categories: [
    { id: "pizza", name: "Pizzas", image: "" },
    { id: "special_pizza", name: "Special Pizza", image: "" },
    { id: "burgers", name: "Burgers", image: "" },
    { id: "wraps", name: "Wraps & Rolls", image: "" },
    { id: "desi", name: "Desi & Broast", image: "" },
    { id: "starters", name: "Starters & Sides", image: "" },
    { id: "pasta", name: "Pastas", image: "" },
    { id: "drinks", name: "Chil Side & Desserts", image: "" }
  ],
  
  toppings: {
    small: 100,
    regular: 200,
    medium: 200,
    large: 300,
    xlarge: 400,
    xl: 400
  },
  
  addons: [
    { id: "garlic_mayo", name: "Garlic Mayo Sauce", price: 80 },
    { id: "habibi_special_sauce", name: "Habibi Special Sauce", price: 100 },
    { id: "extra_cheese", name: "Extra Cheese Slice", price: 60 },
    { id: "extra_patty", name: "Extra Chicken Patty", price: 150 }
  ],

  items: [
    // --- PIZZAS (Standard Flavors) ---
    {
      id: "pizza_tikka",
      category: "pizza",
      name: "Chicken Tikka Pizza",
      description: "Traditional local chicken tikka pieces, pizza sauce, mozzarella cheese, and fresh onions.",
      type: "pizza_standard",
      prices: { small: 550, regular: 1150, large: 1600, xlarge: 2250 },
      image: ""
    },
    {
      id: "pizza_fajita",
      category: "pizza",
      name: "Chicken Fajita Pizza",
      description: "Fajita style chicken strips, bell peppers, onions, tomatoes, and melting mozzarella.",
      type: "pizza_standard",
      prices: { small: 550, regular: 1150, large: 1600, xlarge: 2250 },
      image: ""
    },
    {
      id: "pizza_malai_boti",
      category: "pizza",
      name: "Malai Boti Pizza",
      description: "Creamy Malai Boti chicken chunks, rich white cream sauce, green chilies, and onions.",
      type: "pizza_standard",
      prices: { small: 550, regular: 1150, large: 1600, xlarge: 2250 },
      image: ""
    },
    {
      id: "pizza_peproni",
      category: "pizza",
      name: "Peproni Pizza",
      description: "Generous layout of premium pepperoni over a rich marinara base with loaded cheese.",
      type: "pizza_standard",
      prices: { small: 550, regular: 1150, large: 1600, xlarge: 2250 },
      image: ""
    },
    {
      id: "pizza_corn_lover",
      category: "pizza",
      name: "Corn Lover Pizza",
      description: "Sweet golden corn kernels, special cream base, sliced black olives, and cheese layer.",
      type: "pizza_standard",
      prices: { small: 550, regular: 1150, large: 1600, xlarge: 2250 },
      image: ""
    },
    {
      id: "pizza_cheese_lover",
      category: "pizza",
      name: "Cheese Lover Pizza",
      description: "A decadent blend of mozzarella, cheddar, and parmesan melted on our herb-crusted house dough.",
      type: "pizza_standard",
      prices: { small: 550, regular: 1150, large: 1600, xlarge: 2250 },
      image: ""
    },
    {
      id: "pizza_supreme",
      category: "pizza",
      name: "Chicken Supreme Pizza",
      description: "Spicy chicken, chicken sausages, bell peppers, mushrooms, black olives, and red onions.",
      type: "pizza_standard",
      prices: { small: 550, regular: 1150, large: 1600, xlarge: 2250 },
      image: ""
    },
    {
      id: "pizza_peri_peri",
      category: "pizza",
      name: "Peri Peri Pizza",
      description: "Spicy peri peri marinated chicken chunks, sliced jalapeños, onions, and hot sauce swirl.",
      type: "pizza_standard",
      prices: { small: 550, regular: 1150, large: 1600, xlarge: 2250 },
      image: ""
    },
    {
      id: "pizza_veg_lover",
      category: "pizza",
      name: "Veg Lover Pizza",
      description: "Fresh mushrooms, sliced tomatoes, bell peppers, sweet corn, black olives, and red onions.",
      type: "pizza_standard",
      prices: { small: 550, regular: 1150, large: 1600, xlarge: 2250 },
      image: ""
    },
    {
      id: "pizza_afghan_tikka",
      category: "pizza",
      name: "Afghan Tikka Pizza",
      description: "Tender Afghan style mild chicken boti, yogurt-based green sauce, onions, and white cheese.",
      type: "pizza_standard",
      prices: { small: 550, regular: 1150, large: 1600, xlarge: 2250 },
      image: ""
    },
    {
      id: "pizza_tandoori",
      category: "pizza",
      name: "Tandoori Pizza",
      description: "Smoky tandoori grilled chicken pieces, traditional tandoori sauce, onions, coriander, and lime juice.",
      type: "pizza_standard",
      prices: { small: 550, regular: 1150, large: 1600, xlarge: 2250 },
      image: ""
    },
    {
      id: "pizza_achari",
      category: "pizza",
      name: "Achari Pizza",
      description: "Tangy pickled chicken pieces, homemade achar sauce, red chilies, and layered mozzarella.",
      type: "pizza_standard",
      prices: { small: 550, regular: 1150, large: 1600, xlarge: 2250 },
      image: ""
    },
    {
      id: "pizza_creamy",
      category: "pizza",
      name: "Creamy Pizza",
      description: "House special rich garlic-cream spread base, loaded with herb chicken boti and green toppings.",
      type: "pizza_standard",
      prices: { small: 550, regular: 1150, large: 1600, xlarge: 2250 },
      image: ""
    },

    // --- PIZZAS (Special Flavors) ---
    {
      id: "pizza_beef_bonanza",
      category: "special_pizza",
      name: "Beef Bonanza Pizza",
      description: "Minced beef, juicy beef meatball crumbles, bell peppers, red onions, and hot bbq drizzles.",
      type: "pizza_special",
      prices: { medium: 1500, large: 2000, xl: 2500 },
      image: ""
    },
    {
      id: "pizza_arabic",
      category: "special_pizza",
      name: "Habibi Arabic Pizza",
      description: "Arabic spice chicken kebab bits, garlic sauce base, sesame seeds, and green olives.",
      type: "pizza_special",
      prices: { medium: 1500, large: 2000, xl: 2500 },
      image: ""
    },
    {
      id: "pizza_4in1",
      category: "special_pizza",
      name: "4 in 1 Special Pizza",
      description: "Four corners, four flavors (Tikka, Fajita, Malai Boti, Pepperoni) on a massive single XL crust.",
      type: "pizza_special",
      prices: { medium: 1500, large: 2000, xl: 2500 },
      image: ""
    },
    {
      id: "pizza_donner",
      category: "special_pizza",
      name: "Habibi Donner Pizza",
      description: "Slices of grilled doner meat, white yogurt sauce, pickles, and crisp sliced onions.",
      type: "pizza_special",
      prices: { medium: 1500, large: 2000, xl: 2500 },
      image: ""
    },
    {
      id: "pizza_lasagna",
      category: "special_pizza",
      name: "Lasagna Pizza",
      description: "Layered flat pasta sheets, Bolognese beef sauce, double béchamel, and rich baked mozzarella crust.",
      type: "pizza_special",
      prices: { medium: 1500, large: 2000, xl: 2500 },
      image: ""
    },
    {
      id: "pizza_cheese_steak",
      category: "special_pizza",
      name: "Cheese Steak Pizza",
      description: "Juicy beef steak strips, caramelized onions, melted cheddar cheese sauce, and bell peppers.",
      type: "pizza_special",
      prices: { medium: 1500, large: 2000, xl: 2500 },
      image: ""
    },
    {
      id: "pizza_crown_crust",
      category: "special_pizza",
      name: "Crown Crust Pizza",
      description: "Beautifully crimped crust crown-nodes stuffed with cream cheese and topped with grill chicken boti.",
      type: "pizza_special",
      prices: { medium: 1500, large: 2000, xl: 2500 },
      image: ""
    },
    {
      id: "pizza_behri_kabab",
      category: "special_pizza",
      name: "Behari Kabab Crust",
      description: "Spicy Behari chicken kebab stuffed around the rim of the pizza crust, tikka toppings in the center.",
      type: "pizza_special",
      prices: { medium: 1500, large: 2000, xl: 2500 },
      image: ""
    },
    {
      id: "pizza_cheese_stuff",
      category: "special_pizza",
      name: "Cheese Stuff Pizza",
      description: "Stuffed crust loaded with hot melting stringy mozzarella cheese and cheddar cheese blend.",
      type: "pizza_special",
      prices: { medium: 1500, large: 2000, xl: 2500 },
      image: ""
    },
    {
      id: "pizza_kabab_stuff",
      category: "special_pizza",
      name: "Kebab Stuff Pizza",
      description: "Premium chicken seekh kebabs rolled inside the crust borders, loaded with pizza seasonings.",
      type: "pizza_special",
      prices: { medium: 1500, large: 2000, xl: 2500 },
      image: ""
    },
    {
      id: "pizza_habibi_grill",
      category: "special_pizza",
      name: "Habibi Grill Pizza",
      description: "Charcoal grilled chicken thighs, smoked onions, barbecue sauce drizzle, and fresh green bell peppers.",
      type: "pizza_special",
      prices: { medium: 1500, large: 2000, xl: 2500 },
      image: ""
    },

    // --- BURGERS ---
    {
      id: "burger_classic_beef",
      category: "burgers",
      name: "Classic Beef Burger",
      description: "Flame-grilled beef patty, fresh lettuce, sliced tomatoes, onions, pickles, and classic burger sauce.",
      prices: { default: 580 },
      image: ""
    },
    {
      id: "burger_bomba_beef",
      category: "burgers",
      name: "Bomba Beef Burger",
      description: "Thick double beef patties, loaded with dripping liquid cheddar, crispy onion rings, and spicy bomb sauce.",
      prices: { default: 850 },
      image: ""
    },
    {
      id: "burger_jumbo_beef",
      category: "burgers",
      name: "Jumbo Beef Burger",
      description: "Extra large triple-layered beef patties with triple cheese slices, lettuce, fried egg, and special house dressing.",
      prices: { default: 1050 },
      image: ""
    },
    {
      id: "burger_zinger",
      category: "burgers",
      name: "Zinger Burger",
      description: "Crispy double-crunch deep fried chicken breast fillet, iceberg lettuce, and high-quality mayo spread.",
      prices: { default: 390 },
      image: ""
    },
    {
      id: "burger_petty",
      category: "burgers",
      name: "Petty Burger",
      description: "Traditional breaded fried chicken patty with fresh lettuce and tangy garlic mayo in a soft bun.",
      prices: { default: 300 },
      image: ""
    },
    {
      id: "burger_chapli",
      category: "burgers",
      name: "Chapli Burger",
      description: "Spicy pan-fried local style minced beef chapli kabab patty, mint sauce, onion slices, and tomatoes.",
      prices: { default: 300 },
      image: ""
    },
    {
      id: "burger_tandoori",
      category: "burgers",
      name: "Tandoori Burger",
      description: "Tandoori coal-grilled chicken breast, spicy tandoori spread, green chutney, and onions.",
      prices: { default: 670 },
      image: ""
    },
    {
      id: "burger_pizza",
      category: "burgers",
      name: "Pizza Burger",
      description: "Zinger fillet sandwiched in buns topped with marinara sauce, pizza toppings, and melted baked mozzarella.",
      prices: { default: 500 },
      image: ""
    },
    {
      id: "burger_tower",
      category: "burgers",
      name: "Tower Burger",
      description: "Crispy zinger fillet stacked with hash brown patty, cheese slice, lettuce, and tangy burger sauce.",
      prices: { default: 650 },
      image: ""
    },
    {
      id: "burger_grill",
      category: "burgers",
      name: "Grill Burger",
      description: "Succulent charcoal grilled chicken thigh with smoky sauce and fresh salad toppers.",
      prices: { single: 450, double: 750 },
      image: ""
    },

    // --- WRAPS & ROLLS ---
    {
      id: "wrap_habibi_special",
      category: "wraps",
      name: "Habibi Special Wrap",
      description: "Soft tortilla wrapped with grilled chicken chunks, french fries, cheese sauce, olives, and signature sauce.",
      prices: { default: 550 },
      image: ""
    },
    {
      id: "wrap_grill",
      category: "wraps",
      name: "Grill Wrap",
      description: "Smoky grilled chicken strips, shredded lettuce, bell peppers, and creamy chipotle sauce in flatbread.",
      prices: { default: 650 },
      image: ""
    },
    {
      id: "shawarma_chicken",
      category: "wraps",
      name: "Chicken Shawarma",
      description: "Local pita bread filled with shredded rotisserie chicken, garlic paste, vinegar pickled cucumber, and cabbage.",
      prices: { default: 250 },
      image: ""
    },
    {
      id: "shawarma_zinger",
      category: "wraps",
      name: "Zinger Shawarma",
      description: "Crunchy sliced zinger chicken strips, mayo, and green chili sauce rolled in flat pita bread.",
      prices: { default: 390 },
      image: ""
    },
    {
      id: "paratha_chicken",
      category: "wraps",
      name: "Chicken Paratha Roll",
      description: "Golden flaky paratha roll filled with tikka chicken boti, sliced rings of onion, and tangy mint chutney.",
      prices: { default: 350 },
      image: ""
    },
    {
      id: "paratha_zinger",
      category: "wraps",
      name: "Zinger Paratha Roll",
      description: "Flaky crisp paratha rolled around deep-fried chicken strips, spicy garlic paste, and onions.",
      prices: { default: 430 },
      image: ""
    },
    {
      id: "wrap_malai_boti",
      category: "wraps",
      name: "Malai Boti Wrap",
      description: "Tortilla wrapped with creamy melt-in-the-mouth chicken malai boti chunks and white garlic sauce.",
      prices: { default: 590 },
      image: ""
    },
    {
      id: "shawarma_platter",
      category: "wraps",
      name: "Shawarma Platter",
      description: "Deconstructed chicken shawarma served with extra pita bread sides, hummus, pickled veggies, and garlic dip.",
      prices: { default: 600 },
      image: ""
    },
    {
      id: "extra_bread",
      category: "wraps",
      name: "Extra Bread (Pita)",
      description: "Warm, freshly baked pita flatbread companion.",
      prices: { default: 50 },
      image: ""
    },

    // --- DESI & BROAST ---
    {
      id: "desi_beef_white_karahi",
      category: "desi",
      name: "Beef White Karahi",
      description: "Lean beef chunks slow-cooked in butter, yogurt, cream, fresh ginger, and green chilies.",
      prices: { half_kg: 1200, "1_kg": 2200 },
      image: ""
    },
    {
      id: "desi_beef_red_karahi",
      category: "desi",
      name: "Beef Red Karahi",
      description: "Traditional spicy tomato-based beef karahi garnished with coriander, ginger, and lime.",
      prices: { half_kg: 1200, "1_kg": 2200 },
      image: ""
    },
    {
      id: "desi_mutton_karahi",
      category: "desi",
      name: "Mutton Karahi",
      description: "Fresh premium mutton cooked in direct wok with fresh tomatoes, ginger, and freshly cracked black pepper.",
      prices: { half_kg: 2200, "1_kg": 4200 },
      image: ""
    },
    {
      id: "desi_mutton_peshawari",
      category: "desi",
      name: "Mutton Peshawari Karahi",
      description: "Traditional saltish Peshawari style mutton karahi, cooked with minimal spices and animal fat base.",
      prices: { half_kg: 2300, "1_kg": 4300 },
      image: ""
    },
    {
      id: "desi_mutton_irani",
      category: "desi",
      name: "Mutton Irani Karahi",
      description: "Rich mild mutton gravy prepared with cashew paste, cream, saffron hints, and white butter.",
      prices: { half_kg: 2350, "1_kg": 4400 },
      image: ""
    },
    {
      id: "desi_mutton_sulemani",
      category: "desi",
      name: "Mutton Sulemani Karahi",
      description: "Herby mutton karahi cooked with green chilies, black pepper, and lemon slices. Light on spices.",
      prices: { half_kg: 2250, "1_kg": 4250 },
      image: ""
    },
    {
      id: "desi_chicken_white_handi",
      category: "desi",
      name: "Chicken White Handi",
      description: "Boneless chicken cubes simmered in a clay handi with rich almond cream sauce and white pepper.",
      prices: { half_kg: 1400, "1_kg": 2200 },
      image: ""
    },
    {
      id: "desi_chicken_achari_handi",
      category: "desi",
      name: "Chicken Achari Handi",
      description: "Spicy boneless chicken simmered with local pickled spices, mustard seeds, and ginger strips.",
      prices: { half_kg: 1400, "1_kg": 2200 },
      image: ""
    },
    {
      id: "desi_chicken_malai_handi",
      category: "desi",
      name: "Chicken Malai Handi",
      description: "Ultra-smooth cream gravy cooked in clay handi with cardamom infused chicken cubes.",
      prices: { half_kg: 1400, "1_kg": 2200 },
      image: ""
    },
    {
      id: "desi_chicken_jaipoori",
      category: "desi",
      name: "Chicken Jaipoori Handi",
      description: "Rajasthani style rich spicy gravy cooked with fried onions, crushed nuts, and special spice blend.",
      prices: { half_kg: 1550 },
      image: ""
    },
    {
      id: "desi_chicken_red_handi",
      category: "desi",
      name: "Chicken Red Handi",
      description: "Boneless chicken breast strips cooked in clay handi with tomatoes, garlic paste, and local spices.",
      prices: { half_kg: 1400, "1_kg": 2200 },
      image: ""
    },
    {
      id: "desi_chicken_white_karahi",
      category: "desi",
      name: "Chicken White Karahi",
      description: "Wok-fried chicken bone-in portions simmered in thick yogurt, white pepper, and green chilies.",
      prices: { half_kg: 1400, "1_kg": 2200 },
      image: ""
    },
    {
      id: "desi_chicken_peshawari",
      category: "desi",
      name: "Chicken Peshawari Karahi",
      description: "Traditional salt-cured chicken cooked with sliced tomatoes, green peppers, and black seed highlights.",
      prices: { half_kg: 1600, "1_kg": 2350 },
      image: ""
    },
    {
      id: "desi_chicken_red_karahi",
      category: "desi",
      name: "Chicken Red Karahi",
      description: "Spicy tomato gravy karahi prepared with bone-in chicken, green coriander, and fresh julienned ginger.",
      prices: { half_kg: 1550, "1_kg": 2200 },
      image: ""
    },
    {
      id: "broast_quarter",
      category: "desi",
      name: "Quarter Broast (Spicy)",
      description: "1 Leg, 1 Thigh piece crispy fried, served with hot golden French fries, 1 bun, garlic dip, and 1 regular drink.",
      prices: { default: 650 },
      image: ""
    },
    {
      id: "broast_half",
      category: "desi",
      name: "Half Broast (Spicy)",
      description: "2 Leg, 2 Thigh crispy golden broast pieces, fries, 1 soft bun, garlic dip, fries dip, and 1 regular drink.",
      prices: { default: 1090 },
      image: ""
    },
    {
      id: "broast_full",
      category: "desi",
      name: "Full Broast (Spicy)",
      description: "4 Leg, 4 Thigh giant broast platter, double fries portions, 2 soft buns, 2 garlic dips, 2 fries dips, and 1.5 Ltr cold drink.",
      prices: { default: 2150 },
      image: ""
    },

    // --- STARTERS & SIDES ---
    {
      id: "side_nuggets",
      category: "starters",
      name: "Chicken Nuggets",
      description: "Tender white chicken bites breaded and fried golden crisp, served with ketchup dip.",
      prices: { "6_pcs": 350, "12_pcs": 550 },
      image: ""
    },
    {
      id: "side_wings",
      category: "starters",
      name: "Oven Baked Wings",
      description: "Juicy chicken wings coated in spicy hot buffalo sauce and baked slowly in the brick oven.",
      prices: { "6_pcs": 500, "12_pcs": 1000 },
      image: ""
    },
    {
      id: "side_strips",
      category: "starters",
      name: "Chicken Strips",
      description: "Breaded boneless chicken breast fingers fried crispy, served with garlic mayo sauce.",
      prices: { "5_pcs": 500, "10_pcs": 900 },
      image: ""
    },
    {
      id: "side_loaded_fries",
      category: "starters",
      name: "Loaded Fries",
      description: "Crispy french fries topped with sliced chicken strips, hot liquid cheese sauce, and green jalapeños.",
      prices: { medium: 550, large: 690 },
      image: ""
    },
    {
      id: "side_french_fries",
      category: "starters",
      name: "French Fries",
      description: "Crisp salted potato fries, soft inside and crunchy on the borders.",
      prices: { medium: 350, large: 550 },
      image: ""
    },
    {
      id: "sandwich_habibi_special",
      category: "starters",
      name: "Habibi Special Sandwich",
      description: "Multi-layered club sandwich filled with grilled chicken, cheese slice, omelette, sliced tomatoes, cucumbers, and special spread.",
      prices: { default: 650 },
      image: ""
    },
    {
      id: "sandwich_grill",
      category: "starters",
      name: "Grill Sandwich",
      description: "Panini grilled bread filled with shredded bbq chicken thighs, melting cheddar cheese, and capsicums.",
      prices: { default: 650 },
      image: ""
    },
    {
      id: "sandwich_club",
      category: "starters",
      name: "Club Sandwich",
      description: "Traditional toasted bread sandwich with chicken salad spread, hard-boiled egg slices, and lettuce layers.",
      prices: { default: 550 },
      image: ""
    },
    {
      id: "sandwich_cold_chicken",
      category: "starters",
      name: "Cold Chicken Sandwich",
      description: "Soft chilled bread slices stuffed with finely shredded chicken salad and black pepper mayo.",
      prices: { default: 500 },
      image: ""
    },
    {
      id: "sandwich_cold_veg",
      category: "starters",
      name: "Veg Cold Sandwich",
      description: "Toasted sandwich with layers of fresh cucumbers, tomatoes, carrots, cabbage, and light diet dressing.",
      prices: { default: 480 },
      image: ""
    },
    {
      id: "sandwich_zinger",
      category: "starters",
      name: "Zinger Sandwich",
      description: "Submarine roll filled with crispy zinger chicken chunks, lettuce, and premium garlic mayonnaise.",
      prices: { default: 550 },
      image: ""
    },
    {
      id: "salad_fattoush",
      category: "starters",
      name: "Fattoush Salad",
      description: "Traditional Levantine salad made of toasted pita croutons, mixed greens, radishes, tomatoes, cucumbers, and olive oil.",
      prices: { default: 580 },
      image: ""
    },
    {
      id: "salad_fattoush_chicken",
      category: "starters",
      name: "Fattoush with Grilled Chicken",
      description: "Our signature Fattoush salad topped with tender sliced charcoal-grilled chicken breast pieces.",
      prices: { default: 780 },
      image: ""
    },
    {
      id: "salad_russian",
      category: "starters",
      name: "Special Russian Salad",
      description: "Chilled combination of diced apples, pineapples, sweet peas, potatoes, carrots in sweet cream salad sauce.",
      prices: { default: 270 },
      image: ""
    },
    {
      id: "salad_chana_chaat",
      category: "starters",
      name: "Chana Chaat",
      description: "Spicy chickpea salad mixed with raw onions, chopped tomatoes, green chilies, yogurt, and sweet-sour tamarind syrup.",
      prices: { default: 270 },
      image: ""
    },

    // --- PASTAS ---
    {
      id: "pasta_alfredo",
      category: "pasta",
      name: "Alfredo Pasta",
      description: "Fettuccine pasta tossed in butter-parmesan cream sauce, topped with grilled chicken breast slices and mushrooms.",
      prices: { medium: 650, large: 900 },
      image: ""
    },
    {
      id: "pasta_creamy_special",
      category: "pasta",
      name: "Creamy Habibi Special Pasta",
      description: "Penne pasta cooked in white spicy herb cream sauce, loaded with bell peppers, olives, chicken chunks, and baked cheese cover.",
      prices: { medium: 600, large: 850 },
      image: ""
    },
    {
      id: "pasta_penny_sauce",
      category: "pasta",
      name: "Penny Sauce Pasta",
      description: "Penne pasta cooked in spicy red marinara and white cream mix (pink sauce), roasted garlic, chicken, and broccoli.",
      prices: { medium: 450, large: 690 },
      image: ""
    },
    {
      id: "pasta_macaroni",
      category: "pasta",
      name: "Chicken Macaronies Pasta",
      description: "Elbow macaroni stir-fried in local desified wok style with chicken chunks, capsicums, cabbage, carrots, soy sauce, and chilies.",
      prices: { medium: 400, large: 650 },
      image: ""
    },

    // --- CHIL SIDE & DESSERTS ---
    {
      id: "shake_mango",
      category: "drinks",
      name: "Mango Ice Shake",
      description: "Creamy milkshake blended with sweet mango pulp, vanilla ice cream, and chilled fresh milk.",
      prices: { default: 480 },
      image: ""
    },
    {
      id: "shake_strawberry",
      category: "drinks",
      name: "Strawberry Ice Shake",
      description: "Vibrant pink milkshake blended with sweet strawberries, strawberry ice cream scoop, and fresh cream.",
      prices: { default: 480 },
      image: ""
    },
    {
      id: "shake_kulfi",
      category: "drinks",
      name: "Kulfi Ice Shake",
      description: "Traditional local shake containing crushed khoya kulfi pieces, almond nuts, cardamom, and thick milk.",
      prices: { default: 480 },
      image: ""
    },
    {
      id: "shake_oreo",
      category: "drinks",
      name: "Oreo Ice Shake",
      description: "Indulgent shake containing crushed chocolate Oreo cookies, vanilla-chocolate ice cream, and chocolate fudge syrup.",
      prices: { default: 520 },
      image: ""
    },
    {
      id: "drink_margarita",
      category: "drinks",
      name: "Mint Margarita",
      description: "Refreshing soda blend with freshly squeezed lemon juice, crushed mint leaves, salt, sugar, and ice.",
      prices: { default: 220 },
      image: ""
    },
    {
      id: "drink_sprite_lime",
      category: "drinks",
      name: "Sprite Lime",
      description: "Carbonated lemon-lime soda enhanced with freshly squeezed lime juice and a dash of black salt.",
      prices: { default: 200 },
      image: ""
    },
    {
      id: "icecream_chocolate_vanilla",
      category: "drinks",
      name: "Chocolate Vanilla Ice Cream",
      description: "Three rich scoops of marbled premium chocolate and smooth vanilla ice cream.",
      prices: { default: 380 },
      image: ""
    },
    {
      id: "icecream_mango_vanilla",
      category: "drinks",
      name: "Mango Vanilla Ice Cream",
      description: "Three delicious scoops of mango and vanilla flavored ice cream blend.",
      prices: { default: 380 },
      image: ""
    },
    {
      id: "icecream_strawberry_vanilla",
      category: "drinks",
      name: "Strawberry Vanilla Ice Cream",
      description: "Three creamy scoops featuring strawberry and vanilla flavors, topped with sweet syrup.",
      prices: { default: 380 },
      image: ""
    },
    {
      id: "icecream_kulfi",
      category: "drinks",
      name: "Kulfi Ice Cream (3 Scoop)",
      description: "Traditional desi kulfi flavored ice cream scoops topped with pistachio shavings.",
      prices: { default: 380 },
      image: ""
    },
    {
      id: "icecream_mango",
      category: "drinks",
      name: "Mango Ice Cream (3 Scoop)",
      description: "Three scoops of luscious sweet mango seasonal fruit flavor ice cream.",
      prices: { default: 380 },
      image: ""
    },
    {
      id: "icecream_tutti_frutti",
      category: "drinks",
      name: "Tutti Frutti Ice Cream (3 Scoop)",
      description: "Creamy colorful scoops containing candy candied-fruit bits (ashrafi) and dry nut crunch.",
      prices: { default: 380 },
      image: ""
    },
    {
      id: "icecream_strawberry",
      category: "drinks",
      name: "Strawberry Ice Cream (3 Scoop)",
      description: "Three scoops of creamy pink strawberry flavored ice cream.",
      prices: { default: 380 },
      image: ""
    },
    {
      id: "icecream_oreo",
      category: "drinks",
      name: "Oreo Ice Cream (3 Scoop)",
      description: "Cookies and cream flavored scoops mixed with chunky pieces of sweet Oreo biscuits.",
      prices: { default: 380 },
      image: ""
    },
    {
      id: "icecream_coconut",
      category: "drinks",
      name: "Coconut Ice Cream (3 Scoop)",
      description: "Subtle coconut cream flavored scoops sprinkled with desiccated raw coconut shreds.",
      prices: { default: 380 },
      image: ""
    },
    {
      id: "icecream_pistachio",
      category: "drinks",
      name: "Pistachio Ice Cream (3 Scoop)",
      description: "Light green aromatic pistachio nut flavored ice cream scoops.",
      prices: { default: 380 },
      image: ""
    },
    {
      id: "hot_tea",
      category: "drinks",
      name: "Habibi Special Tea (Karak)",
      description: "Brewed with high-quality cardamom tea leaves, fresh thick milk, and sugar simmered slowly.",
      prices: { default: 130 },
      image: ""
    },
    {
      id: "hot_coffee",
      category: "drinks",
      name: "Hot Coffee",
      description: "Strong aromatic espresso shot combined with steamed milk froth.",
      prices: { default: 380 },
      image: ""
    }
  ]
};

window.HABIBI_DEALS = [
  { id: 1, name: "Habibi Deal 1", contents: "2 Small Pizzas + 1 Ltr Cold Drink", price: 1150, category: "Deals", tag: "Hot Seller", image: "assets/pizza_tikka.png" },
  { id: 2, name: "Habibi Deal 2", contents: "1 Medium Pizza + 6 Hot Wings + 1 Ltr Cold Drink", price: 1700, category: "Deals", tag: "Popular", image: "assets/pizza_tikka.png" },
  { id: 3, name: "Habibi Deal 3", contents: "1 Medium Pizza + 12 Hot Wings + 1.5 Ltr Cold Drink", price: 2200, category: "Deals", tag: "Super Value", image: "assets/pizza_tikka.png" },
  { id: 4, name: "Habibi Deal 4", contents: "1 Medium Pizza + 1 Cheese Stick + 1.5 Ltr Cold Drink", price: 2400, category: "Deals", tag: "New", image: "assets/pizza_tikka.png" },
  { id: 5, name: "Habibi Deal 5", contents: "1 Large Pizza + 6 Hot Wings + 1.5 Ltr Cold Drink", price: 2580, category: "Deals", tag: "Mega Feast", image: "assets/pizza_tikka.png" },
  { id: 6, name: "Habibi Deal 6", contents: "1 Large Pizza + 4 Regular Zinger Burgers + 1.5 Ltr Cold Drink", price: 3250, category: "Deals", tag: "Jumbo Deal", image: "assets/hero_food_collage.png" },
  { id: 7, name: "Habibi Deal 7", contents: "1 Large Pizza + 2 Zinger Burgers + 1 Regular Fries + 1.5 Ltr Cold Drink", price: 2850, category: "Deals", tag: "Party Special", image: "assets/hero_food_collage.png" },
  { id: 8, name: "Habibi Deal 8", contents: "2 Medium Pizzas + 1 Regular Zinger Burger + 1 Regular Fries + 1.5 Ltr Cold Drink", price: 3100, category: "Deals", tag: "Crowd Pleaser", image: "assets/hero_food_collage.png" },
  { id: 9, name: "Habibi Deal 9", contents: "2 Extra Large (XL) Pizzas + 1 Regular Fries + 1.5 Ltr Cold Drink", price: 4850, category: "Deals", tag: "Giant Deal", image: "assets/pizza_tikka.png" },
  { id: 10, name: "Habibi Deal 10", contents: "1 Regular Zinger Burger + 1 Regular Fries + 1 Regular Drink", price: 650, category: "Deals", tag: "Individual Saver", image: "assets/burger_bomba.png" },
  { id: 11, name: "Habibi Deal 11", contents: "2 Cheese Patty Burgers + 2 Regular Drinks", price: 750, category: "Deals", tag: "Duet Offer", image: "assets/burger_bomba.png" },
  { id: 12, name: "Habibi Deal 12", contents: "2 Regular Zinger Burgers + 1 Regular Fries + 2 Regular Drinks", price: 1050, category: "Deals", tag: "Zinger Bundle", image: "assets/burger_bomba.png" },
  { id: 13, name: "Habibi Deal 13", contents: "3 Chicken Shawarmas + 1 Ltr Cold Drink", price: 800, category: "Deals", tag: "Shawarma Combo", image: "assets/burger_bomba.png" },
  { id: 14, name: "Habibi Deal 14", contents: "4 Regular Zinger Burgers + 1.5 Ltr Cold Drink", price: 1950, category: "Deals", tag: "Zinger Craze", image: "assets/burger_bomba.png" },
  { id: 15, name: "Habibi Deal 15", contents: "6 Regular Burgers + 12 Pieces Chicken Nuggets + 1.5 Ltr Cold Drink", price: 2250, category: "Deals", tag: "Family Pack", image: "assets/hero_food_collage.png" },
  { id: 16, name: "Habibi Deal 16", contents: "2 Large Pizzas + 1.5 Ltr Cold Drink", price: 3150, category: "Deals", tag: "Double Fun", image: "assets/pizza_tikka.png" },
  { id: 17, name: "Habibi Deal 17", contents: "1 Beef Burger + 1 Regular Fries + 1 Regular Drink", price: 880, category: "Deals", tag: "Beef Saver", image: "assets/burger_bomba.png" },
  { id: 18, name: "Habibi Deal 18", contents: "2 Beef Burgers + 2 Regular Fries + 1.5 Ltr Cold Drink", price: 1950, category: "Deals", tag: "Beef Bundle", image: "assets/burger_bomba.png" }
];

// --- Automatic Real Food Image Assigner ---
// Populates food images for all categories and menu items
(function populateRealFoodImages() {
  if (window.HABIBI_MENU) {
    if (Array.isArray(window.HABIBI_MENU.categories)) {
      window.HABIBI_MENU.categories.forEach(cat => {
        if (!cat.image) {
          if (cat.id.includes("pizza")) cat.image = "assets/pizza_tikka.png";
          else if (cat.id.includes("burger") || cat.id.includes("wrap")) cat.image = "assets/burger_bomba.png";
          else if (cat.id.includes("desi")) cat.image = "assets/desi_karahi.png";
          else if (cat.id.includes("starter") || cat.id.includes("pasta")) cat.image = "assets/starters_loaded_fries.png";
          else cat.image = "assets/hero_food_collage.png";
        }
      });
    }

    if (Array.isArray(window.HABIBI_MENU.items)) {
      window.HABIBI_MENU.items.forEach(item => {
        if (!item.image) {
          if (item.category === "pizza" || item.category === "special_pizza") item.image = "assets/pizza_tikka.png";
          else if (item.category === "burgers" || item.category === "wraps") item.image = "assets/burger_bomba.png";
          else if (item.category === "desi") item.image = "assets/desi_karahi.png";
          else if (item.category === "starters" || item.category === "pasta") item.image = "assets/starters_loaded_fries.png";
          else item.image = "assets/hero_food_collage.png";
        }
      });
    }
  }
})();

