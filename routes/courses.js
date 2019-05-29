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

// Handle ID param
router.param("id", async (req, res, next, id) => {
    try {
        // Get course with provided ID
        const course = await req.courseService.getById(id);

        // Attach course to request object
        req.course = course;

        // Pass control to next middleware/route
        next();
    } catch (error) {
        // Pass caught errors to error handlers
        next(error);
    }
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
        const user = await req.courseService.create(req.user, courseData);

        // Set Location header
        res.set("Location", `/api/courses/${user.id}`);

        // Respond with 201 Status
        res.status(201).end();
    });

router.route("/:id")
    // GET /api/courses/:id: Get course with provided ID
    .get((req, res) => {
        // Response with course retrived with the provided ID
        res.json(req.course);
    })
    // Add middleware to remaining route handlers in this chain
    .all(authMiddleware, (req, res, next) => {
        // If the authenticated user does not own the requested course,
        if (req.user.id !== req.course.userId) {
            // Create a "forbidden" error
            const error = new Error("You may not modify the requested course because you do not own the course.");
            error.name = "ForbiddenError";
            error.status = 403;

            // Pass error to error handlers
            next(error);
        } else {
            // Otherwise, pass control to next route handler
            next();
        }
    })
    // PUT /api/courses/:id: Update course with provided ID
    .put(async (req, res) => {
        // Define course update data
        const updateData = {
            title: req.body.title,
            description: req.body.description,
            estimatedTime: req.body.estimatedTime,
            materialsNeeded: req.body.materialsNeeded,
        };

        // Update course
        await req.courseService.update(req.course, updateData);

        // Respond with 204 status
        res.status(204).end();
    })
    // DELETE /api/courses/:id: Delete course with provided ID
    .delete(async (req, res) => {
        // Delete user by ID
        await req.courseService.delete(req.user, req.course);

        // Respond with 204 status
        res.status(204).end();
    });

// Export
module.exports = router;
