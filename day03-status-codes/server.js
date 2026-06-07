const express = require("express");
const app = express();
app.use(express.json());
app.disable('x-powered-by')
let users = [
  { id: 1, name: "Alice", email: "alice@test.com" },
  { id: 2, name: "Bob", email: "bob@test.com" },
];

// GET all users
app.get("/users", (req, res) => {
  res.status(200).json(users);
});

// GET one user
app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  res.status(200).json(user);
});

// POST create user
app.post("/users", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const exists = users.find((u) => u.email === email);
  if (exists) {
    return res.status(409).json({ error: "email already exists" });
  }

  const user = { id: users.length + 1, name, email };
  users.push(user);
  res.status(201).json(user);
});

// DELETE user
app.delete("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  const exists = users.find((u) => u.id === id);
  if (!exists) {
    return res.status(404).json({ error: "user not found" });
  }

  users = users.filter((u) => u.id !== id);
  res.status(204).send();
});

app.listen(3000, () => console.log("Server running on port 3000"));
