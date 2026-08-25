const { getDB } = require("../config/db");

const getUsersCollection = () => {
  const db = getDB();

  return db.collection("users");
};

module.exports = {
  getUsersCollection,
};