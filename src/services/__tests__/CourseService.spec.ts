// Imports
import { random } from 'faker';
import { getRepository } from 'typeorm';

import Course from '@/database/entities/Course';
import User from '@/database/entities/User';
import env from '@/env';
import CourseService from '@/services/CourseService';
import UserService from '@/services/UserService';
import {
  generateTestCourse,
  generateTestCourseDto,
} from '@/utils/testing/course';
import { generateTestUser } from '@/utils/testing/user';

// Test utilities
function setupServices() {
  // Get course and user repository
  const courseRepository = getRepository(Course, env);
  const userRepository = getRepository(User, env);

  // Initialize course user service
  const courseService = new CourseService(courseRepository);
  const userService = new UserService(userRepository);

  return { courseRepository, courseService, userRepository, userService };
}

// Test Suite
describe('Course service', () => {
  test('getList method should return a list of all courses', async () => {
    // Setup course service
    const { courseService } = setupServices();

    // Get course listing
    const courses = await courseService.getList();

    // Expect there to be 3 courses in the database
    expect(courses).toHaveLength(3);
  });

  test('create method should create a course', async () => {
    // Setup course service and repository along with user repository
    const { courseRepository, courseService, userRepository } = setupServices();

    // Create test user and DTO for test course
    const user = generateTestUser();
    const courseData = generateTestCourseDto();

    let courseId = '';

    // Persist test user
    await userRepository.save(user);

    try {
      // Create course through service
      courseId = await courseService.create(user, courseData);

      const createdCourse = await courseRepository.findOneOrFail(courseId);

      expect(createdCourse).toHaveProperty('id', courseId);
      expect(createdCourse).toHaveProperty('title', courseData.title);
      expect(createdCourse).toHaveProperty(
        'description',
        courseData.description
      );
      expect(createdCourse).toHaveProperty(
        'estimatedTime',
        courseData.estimatedTime
      );
      expect(createdCourse).toHaveProperty(
        'materialsNeeded',
        courseData.materialsNeeded
      );
    } finally {
      // Remove course with ID, if found
      const courseToCleanup = await courseRepository.findOne(courseId);
      if (courseToCleanup) await courseRepository.remove(courseToCleanup);

      // Remove test user
      await userRepository.remove(user);
    }
  });

  describe('getById method', () => {
    it('should return the course with the given ID, if found', async () => {
      // Setup course service and repository along with user repository
      const {
        courseRepository,
        courseService,
        userRepository,
      } = setupServices();

      // Create and save test user
      const user = generateTestUser();
      await userRepository.save(user);

      // Create and save test course
      const course = generateTestCourse(user);
      await courseRepository.save(course);

      const createdCourse = await courseRepository.findOneOrFail(course.id, {
        relations: ['creator'],
      });

      try {
        // Retrieve course by ID
        const retrievedCourse = await courseService.getCourseById(course.id);

        // Expect courses to match
        expect(retrievedCourse).toEqual(createdCourse);
      } finally {
        // Remove test course and user
        await courseRepository.remove(course);
        await userRepository.remove(user);
      }
    });

    it('should return undefined if no course exists with the given ID', async () => {
      // Setup course service
      const { courseService } = setupServices();

      // Generate unused ID
      const unusedId = random.alphaNumeric(16);

      // Attempt to find course by ID
      const retrievedCourse = await courseService.getCourseById(unusedId);

      // Expect course to be undefined
      expect(retrievedCourse).toBeUndefined();
    });
  });

  test('update method should apply update data', async () => {
    // Setup course service and repository along with user repository
    const { courseRepository, courseService, userRepository } = setupServices();

    // Create and save test user
    const user = generateTestUser();
    await userRepository.save(user);

    // Create and save test course
    const course = generateTestCourse(user);
    const { id: courseId } = await courseRepository.save(course);
    course.id = courseId;

    try {
      // Generate course update data
      const updateData = generateTestCourseDto();

      // Attempt to update course
      await courseService.update(course, updateData);

      // Retrieve updated course
      const updatedCourse = await courseRepository.findOneOrFail(courseId);

      // Expect update data to have been applied
      expect(updatedCourse).toHaveProperty('id', courseId);
      expect(updatedCourse).toHaveProperty('title', updateData.title);
      expect(updatedCourse).toHaveProperty(
        'description',
        updateData.description
      );
      expect(updatedCourse).toHaveProperty(
        'estimatedTime',
        updateData.estimatedTime
      );
      expect(updatedCourse).toHaveProperty(
        'materialsNeeded',
        updateData.materialsNeeded
      );
    } finally {
      // Remove test course
      await courseRepository.remove(course);

      // Remove test user
      await userRepository.remove(user);
    }
  });

  test('delete method should delete the course and make it irrecoverable', async () => {
    // Setup course service and repository along with user repository
    const { courseRepository, courseService, userRepository } = setupServices();

    // Create and save test user
    const user = generateTestUser();
    await userRepository.save(user);

    // Create and save test course
    const course = generateTestCourse(user);
    const { id: courseId } = await courseRepository.save(course);
    course.id = courseId;

    try {
      // Attempt to delete course
      await courseService.delete(course);

      // Verify that course has been deleted by ensuring it can no longer by found by id
      await expect(courseRepository.findOne(courseId)).resolves.toBeUndefined();
    } finally {
      // Attempt to retrieve course to cleanup if it still exists
      const courseToCleanup = await courseRepository.findOne(courseId);

      // If it does, remove it
      if (courseToCleanup) await courseRepository.remove(courseToCleanup);

      // Remove test user
      await userRepository.remove(user);
    }
  });
});
