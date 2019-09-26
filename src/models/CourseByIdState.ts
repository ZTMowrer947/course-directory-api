// Imports
import Course from "../database/entities/Course.entity";
import CourseState from "./CourseState";

// State
interface CourseByIdState extends CourseState {
    course: Course;
}

// Export
export default CourseByIdState;
