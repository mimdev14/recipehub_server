require("dotenv").config();
const { connectDB } = require("./config/db");

const OWNER_EMAIL = "okdoneofficial@gmail.com"; // the email you log in with

const recipes = [
  {
    recipeName: "Classic Beef Burger",
    recipeImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    category: "Lunch",
    cuisineType: "American",
    difficultyLevel: "Easy",
    preparationTime: 25,
    ingredients: "500g ground beef\n4 burger buns\n4 slices cheddar cheese\nLettuce, tomato, onion\nKetchup, mustard\nSalt and pepper",
    instructions: "Season the beef with salt and pepper, form into patties. Grill for 4-5 minutes per side until cooked through. Toast the buns lightly. Layer lettuce, patty, cheese, tomato, and onion. Add condiments and serve hot.",
  },
  {
    recipeName: "Creamy Garlic Pasta",
    recipeImage: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&q=80",
    category: "Dinner",
    cuisineType: "Italian",
    difficultyLevel: "Easy",
    preparationTime: 30,
    ingredients: "400g fettuccine\n4 cloves garlic, minced\n1 cup heavy cream\n1/2 cup parmesan cheese\n2 tbsp butter\nFresh parsley\nSalt and pepper",
    instructions: "Cook pasta according to package instructions. In a pan, melt butter and sauté garlic until fragrant. Add cream and simmer for 3 minutes. Stir in parmesan until melted. Toss pasta in the sauce, garnish with parsley and black pepper.",
  },
  {
    recipeName: "Chicken Biryani",
    recipeImage: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80",
    category: "Dinner",
    cuisineType: "Bangladeshi",
    difficultyLevel: "Hard",
    preparationTime: 90,
    ingredients: "1 kg chicken, cut into pieces\n3 cups basmati rice\n2 onions, sliced\nYogurt, ginger-garlic paste\nBiryani spices, saffron\nGhee, mint leaves",
    instructions: "Marinate chicken in yogurt and spices for 1 hour. Fry onions until golden. Cook chicken until tender. Parboil rice with whole spices. Layer chicken and rice, top with fried onions and saffron milk. Cover and cook on low heat (dum) for 25 minutes.",
  },
  {
    recipeName: "Avocado Toast",
    recipeImage: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80",
    category: "Breakfast",
    cuisineType: "American",
    difficultyLevel: "Easy",
    preparationTime: 10,
    ingredients: "2 slices sourdough bread\n1 ripe avocado\nCherry tomatoes\nRed pepper flakes\nLemon juice\nSalt and olive oil",
    instructions: "Toast the bread until golden and crisp. Mash the avocado with lemon juice and salt. Spread generously on toast. Top with halved cherry tomatoes, a drizzle of olive oil, and red pepper flakes.",
  },
  {
    recipeName: "Chocolate Lava Cake",
    recipeImage: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
    category: "Dessert",
    cuisineType: "Continental",
    difficultyLevel: "Medium",
    preparationTime: 35,
    ingredients: "200g dark chocolate\n200g butter\n4 eggs\n100g sugar\n60g flour\nPinch of salt",
    instructions: "Melt chocolate and butter together. Whisk eggs and sugar until pale, fold into chocolate mix. Sift in flour and salt, mix gently. Pour into greased ramekins. Bake at 200°C for 12 minutes until edges are set but center is soft. Serve immediately.",
  },
  {
    recipeName: "Thai Green Curry",
    recipeImage: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
    category: "Dinner",
    cuisineType: "Thai",
    difficultyLevel: "Medium",
    preparationTime: 40,
    ingredients: "500g chicken thigh, sliced\n2 tbsp green curry paste\n400ml coconut milk\nThai eggplant, bell peppers\nFish sauce, palm sugar\nThai basil leaves",
    instructions: "Fry curry paste in a splash of coconut milk until fragrant. Add chicken and cook until browned. Pour in remaining coconut milk, simmer. Add vegetables and cook until tender. Season with fish sauce and palm sugar. Finish with Thai basil.",
  },
];

async function seed() {
  const db = await connectDB();

  const user = await db.collection("users").findOne({ email: OWNER_EMAIL });
  if (!user) {
    console.error(`No user found with email ${OWNER_EMAIL}. Log in once on the site with this email first, then rerun.`);
    process.exit(1);
  }

  const docs = recipes.map((r) => ({
    ...r,
    authorId: user.authUserId,
    authorName: user.name,
    authorEmail: user.email,
    likesCount: Math.floor(Math.random() * 40),
    isFeatured: false,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  // mark a couple as featured so the home page's Featured section has content
  docs[0].isFeatured = true;
  docs[2].isFeatured = true;

  const result = await db.collection("recipes").insertMany(docs);
  console.log(`Inserted ${result.insertedCount} recipes.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});