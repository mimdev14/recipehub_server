const express = require("express");
const { ObjectId } = require("mongodb");
const { getRecipesCollection, getFavoritesCollection, getReportsCollection } = require("../models/recipeModel");
const { authenticateUser } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

// GET /api/recipes?search=&category=&cuisine=&page=1&limit=9
router.get("/", async (req, res) => {
  try {
    const { search, category, cuisine, page = 1, limit = 9, featured, popular } = req.query;
    const query = { status: { $ne: "removed" } };

    if (search) query.recipeName = { $regex: search, $options: "i" };
    if (category) query.category = { $in: category.split(",") };
    if (cuisine) query.cuisineType = { $in: cuisine.split(",") };
    if (featured === "true") query.isFeatured = true;

    const skip = (Number(page) - 1) * Number(limit);
    const sort = popular === "true" ? { likesCount: -1 } : { createdAt: -1 };

    const collection = getRecipesCollection();
    const [recipes, total] = await Promise.all([
      collection.find(query).sort(sort).skip(skip).limit(Number(limit)).toArray(),
      collection.countDocuments(query),
    ]);

    res.json({ success: true, recipes, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch recipes" });
  }
});

// GET /api/recipes/:id
router.get("/:id", async (req, res) => {
  try {
    const recipe = await getRecipesCollection().findOne({ _id: new ObjectId(req.params.id) });
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    res.json({ success: true, recipe });
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid recipe id" });
  }
});

// GET /api/recipes/mine/list
router.get("/mine/list", authenticateUser, async (req, res) => {
  try {
    const recipes = await getRecipesCollection().find({ authorId: req.user.authUserId }).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, recipes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch your recipes" });
  }
});

// POST /api/recipes
router.post("/", authenticateUser, async (req, res) => {
  try {
    const collection = getRecipesCollection();
    const count = await collection.countDocuments({ authorId: req.user.authUserId });

    if (!req.user.isPremium && count >= 2) {
      return res.status(403).json({ success: false, message: "Free users can add up to 2 recipes. Upgrade to premium for unlimited recipes." });
    }

    const { recipeName, recipeImage, category, cuisineType, difficultyLevel, preparationTime, ingredients, instructions } = req.body;

    if (!recipeName || !recipeImage || !category || !cuisineType || !difficultyLevel || !preparationTime || !ingredients || !instructions) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const recipe = {
      recipeName, recipeImage, category, cuisineType, difficultyLevel, preparationTime,
      ingredients, instructions,
      authorId: req.user.authUserId,
      authorName: req.user.name,
      authorEmail: req.user.email,
      likesCount: 0,
      isFeatured: false,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(recipe);
    res.status(201).json({ success: true, recipe: { ...recipe, _id: result.insertedId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create recipe" });
  }
});

// PUT /api/recipes/:id (owner only)
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const collection = getRecipesCollection();
    const recipe = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    if (recipe.authorId !== req.user.authUserId) return res.status(403).json({ success: false, message: "Not your recipe" });

    const { recipeName, recipeImage, category, cuisineType, difficultyLevel, preparationTime, ingredients, instructions } = req.body;
    const update = {
      ...(recipeName && { recipeName }),
      ...(recipeImage && { recipeImage }),
      ...(category && { category }),
      ...(cuisineType && { cuisineType }),
      ...(difficultyLevel && { difficultyLevel }),
      ...(preparationTime && { preparationTime }),
      ...(ingredients && { ingredients }),
      ...(instructions && { instructions }),
      updatedAt: new Date(),
    };

    await collection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    res.json({ success: true, message: "Recipe updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update recipe" });
  }
});

// DELETE /api/recipes/:id (owner or admin)
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const collection = getRecipesCollection();
    const recipe = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    if (recipe.authorId !== req.user.authUserId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    await getFavoritesCollection().deleteMany({ recipeId: req.params.id });
    res.json({ success: true, message: "Recipe deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete recipe" });
  }
});

// POST /api/recipes/:id/like
router.post("/:id/like", authenticateUser, async (req, res) => {
  try {
    const collection = getRecipesCollection();
    await collection.updateOne({ _id: new ObjectId(req.params.id) }, { $inc: { likesCount: 1 } });
    const recipe = await collection.findOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, likesCount: recipe.likesCount });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to like recipe" });
  }
});

// POST /api/recipes/:id/favorite (toggle)
router.post("/:id/favorite", authenticateUser, async (req, res) => {
  try {
    const favorites = getFavoritesCollection();
    const existing = await favorites.findOne({ userEmail: req.user.email, recipeId: req.params.id });

    if (existing) {
      await favorites.deleteOne({ _id: existing._id });
      return res.json({ success: true, favorited: false });
    }

    await favorites.insertOne({
      userEmail: req.user.email,
      userId: req.user.authUserId,
      recipeId: req.params.id,
      addedAt: new Date(),
    });
    res.json({ success: true, favorited: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update favorite" });
  }
});

// GET /api/recipes/favorites/mine
router.get("/favorites/mine", authenticateUser, async (req, res) => {
  try {
    const favorites = await getFavoritesCollection().find({ userEmail: req.user.email }).toArray();
    const recipeIds = favorites.map((f) => new ObjectId(f.recipeId));
    const recipes = await getRecipesCollection().find({ _id: { $in: recipeIds } }).toArray();
    res.json({ success: true, recipes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch favorites" });
  }
});

// POST /api/recipes/:id/report
router.post("/:id/report", authenticateUser, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: "Reason is required" });

    await getReportsCollection().insertOne({
      recipeId: req.params.id,
      reporterEmail: req.user.email,
      reason,
      status: "pending",
      createdAt: new Date(),
    });
    res.json({ success: true, message: "Report submitted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to submit report" });
  }
});

// --- Admin routes ---

// GET /api/recipes/admin/all
router.get("/admin/all", authenticateUser, requireRole("admin"), async (req, res) => {
  try {
    const recipes = await getRecipesCollection().find({}).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, recipes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch recipes" });
  }
});

// PATCH /api/recipes/admin/:id/feature
router.patch("/admin/:id/feature", authenticateUser, requireRole("admin"), async (req, res) => {
  try {
    const recipe = await getRecipesCollection().findOne({ _id: new ObjectId(req.params.id) });
    await getRecipesCollection().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isFeatured: !recipe.isFeatured } }
    );
    res.json({ success: true, isFeatured: !recipe.isFeatured });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update feature status" });
  }
});

// GET /api/recipes/admin/reports
router.get("/admin/reports", authenticateUser, requireRole("admin"), async (req, res) => {
  try {
    const reports = await getReportsCollection().find({ status: "pending" }).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch reports" });
  }
});

// PATCH /api/recipes/admin/reports/:id/dismiss
router.patch("/admin/reports/:id/dismiss", authenticateUser, requireRole("admin"), async (req, res) => {
  try {
    await getReportsCollection().updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: "dismissed" } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to dismiss report" });
  }
});

// PATCH /api/recipes/admin/reports/:id/remove-recipe
router.patch("/admin/reports/:id/remove-recipe", authenticateUser, requireRole("admin"), async (req, res) => {
  try {
    const report = await getReportsCollection().findOne({ _id: new ObjectId(req.params.id) });
    await getRecipesCollection().updateOne({ _id: new ObjectId(report.recipeId) }, { $set: { status: "removed" } });
    await getReportsCollection().updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: "resolved" } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to remove recipe" });
  }
});

module.exports = router;