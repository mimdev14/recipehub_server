const express = require("express");
const { getUsersCollection } = require("../models/userModel");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const usersCollection = getUsersCollection();

    const users = await usersCollection.find().toArray();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

module.exports = router;