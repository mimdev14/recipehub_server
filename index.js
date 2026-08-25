require("dotenv").config();

const express = require("express");
const { connectDB } = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("RecipeHub server is running");
});

const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`RecipeHub server is running on port ${port}`);
  });
};

startServer();