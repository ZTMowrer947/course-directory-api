// Imports
const express = require("express");
const UserService = require("../services/UserService");

// Express router setup
const router = express.Router();

// Middleware
router.use((req, res, next) => {
    // Provide user service
    req.service = new UserService();
});

// Routes
router.route("/")
    // GET /api/users: Get currently authenticated user
    .get((req, res) => {
        // TODO: Add authentication

        // TODO: Get authenticated user

        // Respond with "Not Implemented" status and message
        res.status(501).json({ message: "Not Implemented Yet"});
    })
    // POST /api/users: Create user
    .post(async (req, res) => {
        // Define user data
        const userData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress,
            password: req.body.emailAddress,
        }

        // Create user
        await req.service.create(userData);

        // Set Location header to root endpoint
        res.set("Location", "/");

        // Set status to 201 and end response
        res.status(201).end();
    });

// Export
module.exports = router;
