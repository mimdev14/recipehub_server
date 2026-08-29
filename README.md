# 🍳 RecipeHub — Server

This is the backend API for RecipeHub, a full-stack recipe-sharing platform.

The server provides APIs for users, recipes, favorites, reports, payments, authentication, and administrative operations.

---

## 🌐 API

**Production API:** [LIVE_SERVER_URL](https://recipehub-server-eight.vercel.app/)

**Client:** [LIVE_CLIENT_URL](https://recipehub-client-gilt.vercel.app/)

---

## 🛠️ Technologies

- Node.js
- Express.js
- MongoDB
- MongoDB Atlas
- Better Auth
- Stripe
- JWT
- dotenv
- CORS
- Nodemon

---

## 📌 Backend Responsibilities

The server handles:

- User management
- Authentication
- Authorization
- Role-based access
- Recipe CRUD operations
- Recipe likes
- Favorites
- Recipe reports
- Premium membership
- Stripe payments
- Transactions
- Admin operations
- User blocking
- Recipe moderation
- Pagination
- Category filtering

---

## 📂 Project Structure

```text
recipehub-server/
│
├── config/
│   └── db.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── ...
│
├── routes/
│   ├── userRoutes.js
│   ├── recipeRoutes.js
│   ├── favoriteRoutes.js
│   ├── reportRoutes.js
│   ├── paymentRoutes.js
│   └── ...
│
├── controllers/
│   └── ...
│
├── lib/
│   └── auth.js
│
├── index.js
├── package.json
├── .env
└── README.md
