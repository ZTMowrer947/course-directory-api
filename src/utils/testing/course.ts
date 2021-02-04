// Imports
import { plainToClass } from 'class-transformer';
import { lorem, random } from 'faker';

import Course from '@/database/entities/Course';
import User from '@/database/entities/User';
import CourseModifyDTO from '@/models/CourseModifyDTO';

// Test utilities
function generateTestCourseData() {
  const title = random.words(3);
  const description = lorem.paragraph();

  return {
    title,
    description,
    estimatedTime: null,
    materialsNeeded: null,
  };
}

function generateTestCourseDto(): CourseModifyDTO {
  return plainToClass(CourseModifyDTO, generateTestCourseData());
}

function generateTestCourse(creator: User): Course {
  const course = plainToClass(Course, generateTestCourseData());
  course.creator = creator;

  return course;
}

// Exports
export { generateTestCourse, generateTestCourseDto };
