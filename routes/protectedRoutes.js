const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/user",
  authenticateUser,
  requireRole("user", "admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "User protected route accessed",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  }
);

router.get(
  "/admin",
  authenticateUser,
  requireRole("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin protected route accessed",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  }
);

module.exports = router;