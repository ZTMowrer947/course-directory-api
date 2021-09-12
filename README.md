# SchoolDatabaseAPI

Treehouse FSJS Techdegree Unit 9 Project - A School database REST API

## Project Description

This project is a REST API for an online course directory. It allows users to view, create, update, and delete basic information regarding courses.

## API Docs

- `/api/users`: User management.

  - `GET`: Retrieves the currently authenticated user.
    - Basic authentication required
    - Successful status code: `200`
    - Possible failure codes:
      - `401`: If authentication credentials are not provided or the provided password is incorrect.
      - `404`: If there is no user in the database with the credential-provided e-mail address.
  - `POST`: Creates a new user.
    - Body properties:
      - `firstName` (required) - The first name of the new user.
      - `lastName` (required) - The last name of the new user.
      - `emailAddress` (required, must be unique) - The unique e-mail address of the new user.
      - `password` (required) - The password of the new user.
    - Successful status code: `201`, returns created user
    - Possible failure codes:
      - `400`: If body validation fails or it the provided e-mail address is in use by another user.

- `/api/courses`: Course list management.

  - `GET`: Gets a list of all courses.
    - Successful status code: `200`
  - `POST`: Creates a new course.

    - Basic authentication required
    - Body properties:
      - `title` (required) - The title of the new course.
      - `description` (required) - The description of the new course.
      - `estimatedTime` (optional) - The estimated time that the course will take.
      - `materialsNeeded` (optional) - The set of needed materials for the course.
    - Successful status code: `201`, returns created course
    - Possible failure codes:
      - `400`: If body validation fails.
      - `401`: If authentication credentials are not provided or the provided password is incorrect.
      - `404`: If there is no user in the database with the credential-provided e-mail address.

  - `/:id`: Management of courses by their ID.

    - `GET`: Gets a single course by its ID.
      - Successful status code: `200`
      - Possible failure codes:
        - `404`: If there is no course in the database with the provided ID.
    - `PUT`: Updates an existing course.

      - Basic authentication required
      - Body properties:
        - `title` (required) - The updated title of the course.
        - `description` (required) - The updated description of the course.
        - `estimatedTime` (optional) - The updated estimated time that the course will take.
        - `materialsNeeded` (optional) - The updated set of needed materials for the course.
      - Successful status code: `201`, returns no content
      - Possible failure codes:

        - `400`: If body validation fails.
        - `401`: If authentication credentials are not provided or the provided password is incorrect.
        - `403`: If the credential-provided e-mail address is associated with a user that does not own the requested course.
        - `404`: If there is no user in the database with the credential-provided e-mail address.

      - `DELETE`: Deletes a course.
        - Basic authentication required
        - Successful status code: `201`, returns no content
        - Possible failure codes:
          - `401`: If authentication credentials are not provided or the provided password is incorrect.
          - `403`: If the credential-provided e-mail address is associated with a user that does not own the requested course.
          - `404`: If there is no user in the database with the credential-provided e-mail address.

## Running the app

This project requires a MySQL database. Spin one up, clone this repository, and in the local folder for the cloned repo, set the DATABASE_URL envvar accordingly in a .env file in the following format:

```
DATABASE_URL=mysql://user:password@hostname:port/database
```

Once that is set up, run the following in order:

```shell
yarn                      # Install dep
yarn prisma migrate dev   # Migrate and seed database
yarn start                # Run the app
```

The server will tell you which port the server is running at, by default 5000.
