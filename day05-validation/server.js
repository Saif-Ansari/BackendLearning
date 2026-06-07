const express = require("express");
const app = express();

app.disable("x-powered-by");
app.use(express.json());

let users = [
  { id: 1, name: "Alice", email: "alice@test.com" },
  { id: 2, name: "Bob", email: "bob@test.com" },
];

// validation helper
function validateUser(data) {
    console.log("Validating user data:", data);
  const errors = [];

  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    errors.push({
      field: "name",
      message: "name is required and must be a string",
    });
  }

  if (!data.email || typeof data.email !== "string") {
    errors.push({ field: "email", message: "email is required" });
  } else if (!data.email.includes("@")) {
    errors.push({ field: "email", message: "email must be valid" });
  }

  return errors;
}

app.post("/users", (req, res) => {
  const errors = validateUser(req.body);

  if (errors.length > 0) {
    return res
      .status(422)
      .json({ error: "validation failed", details: errors });
  }

  const exists = users.find((u) => u.email === req.body.email);
  if (exists) {
    return res.status(409).json({ error: "email already exists" });
  }

  const user = {
    id: users.length + 1,
    name: req.body.name.trim(),
    email: req.body.email,
  };
  users.push(user);
  res.status(201).json(user);
});

app.listen(3000, () => console.log("Server running on port 3000"));
