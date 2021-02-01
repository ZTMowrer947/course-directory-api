// Imports
import { plainToClass } from 'class-transformer';
import { Connection } from 'typeorm';
import User from './entities/User';
import Course from './entities/Course';

// Seeding function
const seed = async (connection: Connection): Promise<void> => {
  // Get entity manager
  const { manager: entityManager } = connection;

  // Define list of entity types
  const entityList = [User, Course];

  // Count instances of each entity
  const entityCounts = await Promise.all(
    entityList.map((Entity) => entityManager.count(Entity))
  );

  // Reduce the counts into a sum
  const totalEntityCount = entityCounts.reduce(
    (total, count) => total + count,
    0
  );

  // If there are no entities in the database,
  if (totalEntityCount === 0) {
    // Continue with seeding
    // Define seed data
    const userSeedData = [
      {
        firstName: 'Joe',
        lastName: 'Smith',
        emailAddress: 'joe@smith.com',
        password: 'joepassword',
      },
      {
        firstName: 'Sally',
        lastName: 'Jones',
        emailAddress: 'sally@jones.com',
        password: 'sallypassword',
      },
    ];

    // Create users
    const users = plainToClass(User, userSeedData);

    // Persist users to database
    await entityManager.save(users);

    // Define course seed data
    const courseSeedData = [
      {
        creator: users[0],
        title: 'Build a Basic Bookcase',
        description:
          "High-end furniture projects are great to dream about. But unless you have a well-equipped shop and some serious woodworking experience to draw on, it can be difficult to turn the dream into a reality.\n\nNot every piece of furniture needs to be a museum showpiece, though. Often a simple design does the job just as well and the experience gained in completing it goes a long way toward making the next project even better.\n\nOur pine bookcase, for example, features simple construction and it's designed to be built with basic woodworking tools. Yet, the finished project is a worthy and useful addition to any room of the house. While it's meant to rest on the floor, you can convert the bookcase to a wall-mounted storage unit by leaving off the baseboard. You can secure the cabinet to the wall by screwing through the cabinet cleats into the wall studs.\n\nWe made the case out of materials available at most building-supply dealers and lumberyards, including 1/2 x 3/4-in. parting strip, 1 x 2, 1 x 4 and 1 x 10 common pine and 1/4-in.-thick lauan plywood. Assembly is quick and easy with glue and nails, and when you're done with construction you have the option of a painted or clear finish.\n\nAs for basic tools, you'll need a portable circular saw, hammer, block plane, combination square, tape measure, metal rule, two clamps, nail set and putty knife. Other supplies include glue, nails, sandpaper, wood filler and varnish or paint and shellac.\n\nThe specifications that follow will produce a bookcase with overall dimensions of 10 3/4 in. deep x 34 in. wide x 48 in. tall. While the depth of the case is directly tied to the 1 x 10 stock, you can vary the height, width and shelf spacing to suit your needs. Keep in mind, though, that extending the width of the cabinet may require the addition of central shelf supports.",
        estimatedTime: '12 hours',
        materialsNeeded:
          '* 1/2 x 3/4 inch parting strip\n* 1 x 2 common pine\n* 1 x 4 common pine\n* 1 x 10 common pine\n* 1/4 inch thick lauan plywood\n* Finishing Nails\n* Sandpaper\n* Wood Glue\n* Wood Filler\n* Minwax Oil Based Polyurethane\n',
      },
      {
        creator: users[1],
        title: 'Learn How to Program',
        description:
          "In this course, you'll learn how to write code like a pro!",
        estimatedTime: '6 hours',
        materialsNeeded:
          '* Notebook computer running Mac OS X or Windows\n* Text editor',
      },
      {
        creator: users[1],
        title: 'Learn How to Test Programs',
        description: "In this course, you'll learn how to test programs.",
      },
    ];

    // Create courses
    const courses = plainToClass(Course, courseSeedData);

    // Persist courses to database
    await entityManager.save(courses);
  }
};

// Export
export default seed;
