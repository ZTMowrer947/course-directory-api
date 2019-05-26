// Imports
const express = require("express");
const userRouter = require("./users");

// Express router setup
const router = express.Router();

// Routes
router.use("/users", userRouter);

// Export
module.exports = router;
