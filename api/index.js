require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { connectDB } = require("../config/db");
const userRoutes = require("../routes/userRoutes");
const protectedRoutes = require("../routes/protectedRoutes");
const recipeRoutes = require("../routes/recipeRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

let dbReady;
app.use(async (req, res, next) => {
  if (!dbReady) dbReady = connectDB();
  await dbReady;
  next();
});

app.use("/api/users", userRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/recipes", recipeRoutes);

app.get("/", (req, res) => {
  res.send("RecipeHub server is running");
});

module.exports = app;