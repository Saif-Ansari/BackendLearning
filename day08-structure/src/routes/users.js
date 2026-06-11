const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.get("/", usersController.getAll);
router.get("/:id", usersController.getOne);
router.post("/", usersController.create);

module.exports = router;
