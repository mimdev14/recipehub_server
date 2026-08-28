const { getDB } = require("../config/db");

const getRecipesCollection = () => getDB().collection("recipes");
const getFavoritesCollection = () => getDB().collection("favorites");
const getReportsCollection = () => getDB().collection("reports");

module.exports = { getRecipesCollection, getFavoritesCollection, getReportsCollection };