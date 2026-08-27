require("dotenv").config();

const express = require("express");
const { connectDB } = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/protected", protectedRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("RecipeHub server is running");
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`RecipeHub server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();