/* eslint class-methods-use-this: ["error", { "exceptMethods": ["create"] }] */
// Imports
import { EntityRepository } from 'typeorm';

import { EntityId } from '@/entities/base';
import Course from '@/entities/course.entity';
import User from '@/entities/user.entity';

import BaseRepository, { IRepository, TypeOrPromise } from './base';

// Repository interface
interface ICourseRepository extends IRepository<Course> {
  create(courseData: Course): TypeOrPromise<EntityId>;
  create(courseData: Course, creator: User): TypeOrPromise<EntityId>;
}

// Repository
@EntityRepository(Course)
class CourseRepository extends BaseRepository<Course>
  implements ICourseRepository {
  findAll(): Promise<Course[]> {
    return this.repository.find();
  }

  async findById(
    id: EntityId,
    includeRelations: boolean
  ): Promise<Course | null> {
    // Create query builder
    let query = this.repository.createQueryBuilder('course');

    // Include relations if desired
    if (includeRelations) {
      query = query.leftJoinAndSelect('course.creator', 'user');
    }

    // Complete and execute query
    return (await query.where('course.id = :id', { id }).getOne()) ?? null;
  }

  create(courseData: Course): TypeOrPromise<EntityId>;

  create(courseData: Course, creator?: User): TypeOrPromise<EntityId> {
    if (!creator) {
      throw new Error('Method not implemented');
    }

    const newCourse = courseData;
    newCourse.creator = creator;

    return this.repository.save(newCourse).then(({ id }) => id);
  }
}

// Exports
export default CourseRepository;
export type { ICourseRepository };
