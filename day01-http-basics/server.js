const express = require("express");
const app = express();

app.use(express.json()); // parses request body

app.get("/hello", (req, res) => {
  console.log("Method:", req.method);
  console.log("Content-Type:", req.headers["content-type"]);
  // never log full headers in production

  res.status(200).json({ message: "it works" });
});

app.post("/hello", (req, res) => {
  console.log("Method:", req.method);
  console.log("Body:", req.body);

  res.status(200).json({ received: req.body });
});
app.listen(3000, () => console.log("Server running on port 3000"));
