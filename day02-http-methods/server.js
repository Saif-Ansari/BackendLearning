const express = require("express");
const app = express();
app.use(express.json());

// fake in-memory database for now
let users = [
  { id: 1, name: "Alice", email: "alice@test.com" },
  { id: 2, name: "Bob", email: "bob@test.com" },
];

// GET - read all users
app.get("/users", (req, res) => {
  res.status(200).json(users);
});

// GET - read one user
app.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  res.status(200).json(user);
});

// POST - create a user
app.post("/users", (req, res) => {
  const user = { id: users.length + 1, ...req.body };
  users.push(user);
  res.status(201).json(user);
});

// PUT - replace a user entirely
app.put("/users/:id", (req, res) => {
  const index = users.findIndex((u) => u.id === parseInt(req.params.id));
  users[index] = { id: parseInt(req.params.id), ...req.body };
  res.status(200).json(users[index]);
});

// DELETE - remove a user
app.delete("/users/:id", (req, res) => {
  users = users.filter((u) => u.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.listen(3000, () => console.log("Server running on port 3000"));
