// Imports
const express = require("express");

// Express router setup
const router = express.Router();

// Routes
router.route("/")
    // GET /api/courses: Get list of courses
    .get((req, res) => {
        // TODO: Get courses
        
        // Respond with "Not Implemented" status and message
        res.status(501).json({ message: "Not Implemented Yet"});
    })
    // POST /api/courses: Create new course
    .post((req, res) => {
        // TODO: Create course

        // Respond with "Not Implemented" status and message
        res.status(501).json({ message: "Not Implemented Yet"});
    });

router.route("/:id")
    // GET /api/courses/:id: Get course with provided ID
    .get((req, res) => {
        // TODO: Get user by ID

        // Respond with "Not Implemented" status and message
        res.status(501).json({ message: "Not Implemented Yet"});
    })
    // PUT /api/courses/:id: Update course with provided ID
    .put((req, res) => {
        // TODO: Update user by ID

        // Respond with "Not Implemented" status and message
        res.status(501).json({ message: "Not Implemented Yet"});
    })
    // DELETE /api/courses/:id: Delete course with provided ID
    .delete((req, res) => {
        // TODO: Delete user by ID

        // Respond with "Not Implemented" status and message
        res.status(501).json({ message: "Not Implemented Yet"});
    });

// Export
module.exports = router;
