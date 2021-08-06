// Imports
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

import Course from '@/database/entities/Course';
import User from '@/database/entities/User';
import env from '@/env';
import CourseModifyDTO from '@/models/CourseModifyDTO';

// Service
@Service()
export default class CourseService {
  private repository: Repository<Course>;

  public constructor(
    @InjectRepository(Course, env) repository: Repository<Course>
  ) {
    this.repository = repository;
  }

  public async getList(): Promise<Course[]> {
    // Create query
    const query = this.repository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.creator', 'user');

    // Execute query and get results
    const courses = await query.getMany();

    // Return results
    return courses;
  }

  public async getCourseById(id: string): Promise<Course | undefined> {
    // Create query
    const query = this.repository
      .createQueryBuilder('course')
      .where('course.id = :id', { id })
      .leftJoinAndSelect('course.creator', 'user');

    // Execute query and get result
    const course = await query.getOne();

    // Otherwise, return result
    return course;
  }

  public async create(
    user: User,
    courseData: CourseModifyDTO
  ): Promise<string> {
    // Create course instance
    const course = new Course();

    // Set course properties
    course.title = courseData.title;
    course.description = courseData.description;
    course.estimatedTime = courseData.estimatedTime || null;
    course.materialsNeeded = courseData.materialsNeeded || null;

    // Attach user to course
    course.creator = user;

    // Persist course to database
    await this.repository.save(course);

    // Return ID of new course
    return course.id;
  }

  public async update(
    course: Course,
    updateData: CourseModifyDTO
  ): Promise<void> {
    // Define new course instance
    const updatedCourse = new Course();

    // Set course properties
    updatedCourse.id = course.id;
    updatedCourse.title = updateData.title;
    updatedCourse.description = updateData.description;
    updatedCourse.estimatedTime = updateData.estimatedTime ?? null;
    updatedCourse.materialsNeeded = updateData.materialsNeeded ?? null;
    updatedCourse.creator = course.creator;

    // Persist updated course to database
    await this.repository.save(updatedCourse);
  }

  public async delete(course: Course): Promise<void> {
    // Delete course from database
    await this.repository.remove(course);
  }
}
