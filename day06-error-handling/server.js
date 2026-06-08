const express = require("express");
const app = express();

app.disable("x-powered-by");
app.use(express.json());

let users = [{ id: 1, name: "Alice", email: "alice@test.com" }];

// helper to wrap async routes — catches errors and passes to next()
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

app.get(
  "/users",
  asyncHandler(async (req, res) => {
    res.status(200).json(users);
  }),
);

app.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new AppError("id must be a number", 400);
    }

    const user = users.find((u) => u.id === id);
    if (!user) {
      throw new AppError("user not found", 404);
    }

    res.status(200).json(user);
  }),
);

// simulate a random server crash
app.get(
  "/crash",
  asyncHandler(async (req, res) => {
    throw new Error("something went wrong internally");
  }),
);

// 404 handler — catches any route that doesn't exist
app.use((req, res) => {
  res.status(404).json({ error: "route not found" });
});

// global error handler — must be last, must have 4 arguments
app.use((err, req, res, next) => {
  console.error(err); // log full error on server

  // if it's our AppError, use its status code
  // if it's an unexpected error, return 500
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "something went wrong";

  res.status(statusCode).json({ error: message });
});

app.listen(4000, () => console.log("Server running on port 4000"));
