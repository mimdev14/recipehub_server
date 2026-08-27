const express = require("express");
const { getUsersCollection } = require("../models/userModel");
const { createOrUpdateUser } = require("../services/userService");

const router = express.Router();

/**
 * Sync Better Auth user with RecipeHub user collection
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
 * Temporary admin-development endpoint.
 * We will protect this later.
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

module.exports = router;