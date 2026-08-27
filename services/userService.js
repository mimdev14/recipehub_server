const { getUsersCollection } = require("../models/userModel");

const createOrUpdateUser = async ({
  authUserId,
  name,
  email,
  image,
}) => {
  const usersCollection = getUsersCollection();

  if (!authUserId || !email) {
    throw new Error("Authentication user ID and email are required");
  }

  // Find existing RecipeHub user by email
  const existingUser = await usersCollection.findOne({
    email,
  });

  // Existing user
  if (existingUser) {
    const updateData = {
      name: name || existingUser.name,
      image: image || existingUser.image || existingUser.photo || "",
      updatedAt: new Date(),
      lastLogin: new Date(),
    };

    // Add Better Auth ID if it doesn't exist
    if (!existingUser.authUserId) {
      updateData.authUserId = authUserId;
    }

    await usersCollection.updateOne(
      { _id: existingUser._id },
      {
        $set: updateData,
      }
    );

    return await usersCollection.findOne({
      _id: existingUser._id,
    });
  }

  // New RecipeHub user
  const newUser = {
    authUserId,
    name: name || "RecipeHub User",
    email,
    image: image || "",
    role: "user",
    isBlocked: false,
    isPremium: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
  };

  const result = await usersCollection.insertOne(newUser);

  return await usersCollection.findOne({
    _id: result.insertedId,
  });
};

module.exports = {
  createOrUpdateUser,
};