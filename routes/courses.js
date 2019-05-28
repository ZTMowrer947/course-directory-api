// Imports
const express = require("express");
const authMiddleware = require("../middleware/auth");
const CourseService = require("../services/CourseService");
const UserService = require("../services/UserService");

// Express router setup
const router = express.Router();

// Middleware
router.use((req, res, next) => {
    // Provide services on request object
    req.userService = new UserService();
    req.courseService = new CourseService();

    // Pass control to next middleware/route
    next();
});

// Routes
router.route("/")
    // GET /api/courses: Get list of courses
    .get(async (req, res) => {
        // Get courses
        const courses = await req.courseService.getList();
        
        // Respond with list of courses
        res.json(courses);
    })
    // POST /api/courses: Create new course
    .post(authMiddleware, async (req, res) => {
        // Define course data
        const courseData = {
            title: req.body.title,
            description: req.body.description,
            estimatedTime: req.body.estimatedTime,
            materialsNeeded: req.body.materialsNeeded,
        };

        // Create course
        await req.courseService.create(req.user, courseData);

        // Respond with 201 Status
        res.status(201).end();
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
