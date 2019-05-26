// Imports
const express = require("express");
const authMiddleware = require("../middleware/auth");
const UserService = require("../services/UserService");

// Express router setup
const router = express.Router();

// Middleware
router.use((req, res, next) => {
    // Provide user service
    req.userService = new UserService();

    // Pass control to next middleware/route
    next();
});

// Routes
router.route("/")
    // GET /api/users: Get currently authenticated user
    .get(authMiddleware, (req, res) => {
        // Response with authenticated user
        res.json(req.user);
    })
    // POST /api/users: Create user
    .post(async (req, res) => {
        // Define user data
        const userData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress,
            password: req.body.password,
        }

        // Create user
        await req.userService.create(userData);

        // Set Location header to root endpoint
        res.set("Location", "/");

        // Set status to 201 and end response
        res.status(201).end();
    });

// Export
module.exports = router;
