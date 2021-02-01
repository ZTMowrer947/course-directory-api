// Imports
import { Expose } from 'class-transformer';
import { IsNotEmpty, MaxLength } from 'class-validator';

import Course from '@/database/entities/Course';

// Class
export default class CourseModifyDTO implements Partial<Course> {
  @Expose()
  @IsNotEmpty({ message: 'title is a required field.' })
  @MaxLength(127, {
    message: 'title must be no more than 127 characters long.',
  })
  public title!: string;

  @Expose()
  @IsNotEmpty({ message: 'description is a required field.' })
  public description!: string;

  @Expose()
  public estimatedTime?: string;

  @Expose()
  public materialsNeeded?: string;
}
