const { verifyToken } = require("../utils/jwt");
const { getUsersCollection } = require("../models/userModel");

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.recipehub_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = verifyToken(token);

    const usersCollection = getUsersCollection();

    const user = await usersCollection.findOne({
      authUserId: decoded.authUserId,
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
    console.error("JWT authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

module.exports = {
  authenticateUser,
};