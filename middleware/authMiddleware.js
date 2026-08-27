const { getUsersCollection } = require("../models/userModel");

const authenticateUser = async (req, res, next) => {
  try {
    const authUserId = req.headers["x-auth-user-id"];

    if (!authUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const usersCollection = getUsersCollection();

    const user = await usersCollection.findOne({
      authUserId,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = {
  authenticateUser,
};