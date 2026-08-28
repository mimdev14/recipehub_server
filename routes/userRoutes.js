const express = require("express");
const { getUsersCollection } = require("../models/userModel");
const { createOrUpdateUser } = require("../services/userService");
const { generateToken } = require("../utils/jwt");
const { authenticateUser } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { ObjectId } = require("mongodb");

const router = express.Router();

/**
 * Sync Better Auth user with RecipeHub
 */
router.post("/sync", async (req, res) => {
  try {
    const {
      authUserId,
      name,
      email,
      image,
    } = req.body;

    if (!authUserId || !email) {
      return res.status(400).json({
        success: false,
        message: "Authentication user ID and email are required",
      });
    }

    const user = await createOrUpdateUser({
      authUserId,
      name,
      email,
      image,
    });

    // Generate JWT
    const token = generateToken(user);

    // Store JWT in HTTPOnly cookie
    res.cookie("recipehub_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send response
    return res.status(200).json({
      success: true,
      message: "User synchronized successfully",
      user,
    });
  } catch (error) {
    console.error("User sync error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to synchronize user",
    });
  }
});

/**
 * Get all users
 */
router.get("/", async (req, res) => {
  try {
    const usersCollection = getUsersCollection();

    const users = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});
router.patch("/:id/block", authenticateUser, requireRole("admin"), async (req, res) => {
  try {
    const usersCollection = getUsersCollection();
    await usersCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { isBlocked: true } });
    res.json({ success: true, message: "User blocked" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to block user" });
  }
});

router.patch("/:id/unblock", authenticateUser, requireRole("admin"), async (req, res) => {
  try {
    const usersCollection = getUsersCollection();
    await usersCollection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: { isBlocked: false } });
    res.json({ success: true, message: "User unblocked" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to unblock user" });
  }
});

router.get("/me/stats", authenticateUser, async (req, res) => {
  try {
    const { getDB } = require("../config/db");
    const db = getDB();

    const [totalRecipes, totalFavorites, recipes] = await Promise.all([
      db.collection("recipes").countDocuments({ authorId: req.user.authUserId }),
      db.collection("favorites").countDocuments({ userEmail: req.user.email }),
      db.collection("recipes").find({ authorId: req.user.authUserId }).toArray(),
    ]);

    const totalLikesReceived = recipes.reduce((sum, r) => sum + (r.likesCount || 0), 0);

    res.json({
      success: true,
      stats: { totalRecipes, totalFavorites, totalLikesReceived, isPremium: !!req.user.isPremium },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

router.patch("/me", authenticateUser, async (req, res) => {
  try {
    const usersCollection = getUsersCollection();
    const { name, image } = req.body;
    const update = { ...(name && { name }), ...(image && { image }), updatedAt: new Date() };

    await usersCollection.updateOne({ authUserId: req.user.authUserId }, { $set: update });
    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});

module.exports = router;