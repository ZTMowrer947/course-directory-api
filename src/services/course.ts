// Imports
import CourseDto from '@/dto/course';
import { EntityId } from '@/entities/base';
import Course from '@/entities/course.entity';
import User from '@/entities/user.entity';
import { TypeOrPromise } from '@/repos/base';
import { ICourseRepository } from '@/repos/course';

import BaseService, { IService } from './base';

// Service interface
interface ICourseService extends IService<Course, CourseDto> {
  create(courseData: CourseDto): TypeOrPromise<EntityId>;

  create(courseData: CourseDto, creator: User): TypeOrPromise<EntityId>;
}

// Service
class CourseService extends BaseService<Course, CourseDto>
  implements ICourseService {
  #courseRepository: ICourseRepository;

  constructor(repository: ICourseRepository) {
    super(repository);
    this.#courseRepository = repository;
  }

  create(courseData: CourseDto, creator?: User): TypeOrPromise<EntityId> {
    if (!creator) {
      throw new Error('Method not implemented');
    }

    const course = courseData.toEntity();

    return this.#courseRepository.create(course, creator);
  }
}
// Exports
export default CourseService;
