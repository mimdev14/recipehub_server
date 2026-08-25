const { getUsersCollection } = require("../models/userModel");

const createUser = async (userData) => {
  const usersCollection = getUsersCollection();

  const existingUser = await usersCollection.findOne({
    email: userData.email,
  });

  if (existingUser) {
    return existingUser;
  }

  const newUser = {
    name: userData.name,
    email: userData.email,
    image: userData.image || "",
    role: "user",
    isBlocked: false,
    isPremium: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await usersCollection.insertOne(newUser);

  return {
    ...newUser,
    _id: result.insertedId,
  };
};

module.exports = {
  createUser,
};