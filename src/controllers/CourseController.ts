// Imports
import { JsonController } from "routing-controllers";

import CourseService from "../services/Course.service";

// Controller
@JsonController("/api/courses")
export default class CourseController {
    private courseService: CourseService;

    constructor(courseService: CourseService) {
        this.courseService = courseService;
    }
}
