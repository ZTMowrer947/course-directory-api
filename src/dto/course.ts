// Imports
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, MaxLength } from 'class-validator';

import Course from '../entities/course.entity';
import DtoBase from './base';

// Course DTO
@Exclude()
class CourseDto extends DtoBase<Course> implements Partial<Course> {
  @Expose()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255, {
    message: "I would sure hope there isn't a course with that long a title...",
  })
  title!: string;

  @Expose()
  @IsNotEmpty({ message: 'Description is required' })
  description!: string;

  @Expose()
  estimatedTime!: string | null;

  @Expose()
  materialsNeeded!: string | null;

  constructor(course?: Course) {
    super(course);

    if (course) {
      this.title = course.title;
      this.description = course.description;
      this.estimatedTime = course.estimatedTime;
      this.materialsNeeded = course.materialsNeeded;
    }
  }

  toEntity(): Course {
    const course = new Course();
    course.id = this.id;
    course.title = this.title;
    course.description = this.description;
    course.estimatedTime = this.estimatedTime;
    course.materialsNeeded = this.materialsNeeded;

    return course;
  }
}

// Exports
export default CourseDto;
