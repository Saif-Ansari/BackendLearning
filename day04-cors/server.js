const express = require("express");
const cors = require("cors");
const app = express();

app.disable("x-powered-by");
app.use(express.json());

// try without cors first, then add it
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/users", (req, res) => {
  res.status(200).json([{ id: 1, name: "Alice" }]);
});

app.listen(5000, () => console.log("Server running on port 5000"));
