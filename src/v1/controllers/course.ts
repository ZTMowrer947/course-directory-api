// Imports
import { Context } from 'koa';
import {
  Authorized,
  Body,
  Ctx,
  CurrentUser,
  Delete,
  ForbiddenError,
  Get,
  JsonController,
  OnUndefined,
  Param,
  Post,
  Put,
} from 'routing-controllers';
import { Connection } from 'typeorm';
import { InjectConnection } from 'typeorm-typedi-extensions';

import CourseDto from '@/dto/course';
import { EntityId } from '@/entities/base';
import Course from '@/entities/course.entity';
import User from '@/entities/user.entity';
import CourseRepository from '@/repos/course';
import CourseService from '@/services/course';
import { getConfigNameFromEnv } from '@/utils/db';

// Controller
@JsonController('/courses')
class CourseController {
  #courseService: CourseService;

  constructor(
    @InjectConnection(getConfigNameFromEnv()) connection: Connection
  ) {
    const repo = connection.getCustomRepository(CourseRepository);
    this.#courseService = new CourseService(repo);
  }

  @Get('/')
  async getList(): Promise<Course[]> {
    return this.#courseService.getAll();
  }

  @Get('/:id')
  async get(@Param('id') id: EntityId): Promise<Course | undefined> {
    return this.#courseService.getById(id, true);
  }

  @Authorized()
  @Post('/')
  @OnUndefined(201)
  async post(
    @Ctx() ctx: Context,
    @CurrentUser({ required: true }) user: User,
    @Body() courseData: CourseDto
  ): Promise<void> {
    // Create course and get ID
    const id = await this.#courseService.create(courseData, user);

    // Get base URL
    const baseURL = `${ctx.request.protocol}://${ctx.request.host}`;

    // Set Location header
    ctx.set('Location', `${baseURL}/api/v1/courses/${id}`);
  }

  @Authorized()
  @Put('/:id')
  @OnUndefined(204)
  async put(
    @Param('id') id: EntityId,
    @CurrentUser({ required: true }) user: User,
    @Body() updateData: CourseDto
  ): Promise<void> {
    // Get course by ID
    const course = await this.#courseService.getById(id, true);

    // If current user does not own course, throw 403 error
    if (user.id !== course.creator.id)
      throw new ForbiddenError('Only the owner of a course may modify it.');

    // Otherwise, update course
    await this.#courseService.update(course.id, updateData);
  }

  @Authorized()
  @Delete('/:id')
  @OnUndefined(204)
  async delete(
    @Param('id') id: EntityId,
    @CurrentUser({ required: true }) user: User
  ): Promise<void> {
    // Get course by ID
    const course = await this.#courseService.getById(id, true);

    // If current user does not own course, throw 403 error
    if (user.id !== course.creator.id)
      throw new ForbiddenError('Only the owner of a course may modify it.');

    // Otherwise, delete course
    await this.#courseService.delete(course.id);
  }
}

// Exports
export default CourseController;
