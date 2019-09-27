// Imports

// Test Suite
describe("/api/v1/courses", () => {
    describe("GET method", () => {
        it.todo("should get a list of courses");
    });

    describe("POST method", () => {
        it.todo("should return a 401 error if no authentication is provided");

        it.todo(
            "should create a new course given user authentication and valid data"
        );

        it.todo("should return a 400 error when given invalid data");
    });

    describe("/:id", () => {
        describe("GET method", () => {
            it.todo("should return the course with the given ID, if found");

            it.todo(
                "should return a 404 error if no course exists with the given ID"
            );
        });

        describe("PUT method", () => {
            it.todo(
                "should update the course with the given ID when given proper user authentication and valid update data"
            );

            it.todo("should have successfully applied the updates");

            it.todo(
                "should return a 401 error if no authentication is provided"
            );

            it.todo(
                "should return a 403 error if the authenticating user did not create the course to be updated"
            );

            it.todo(
                "should return a 404 error if no course exists with the given ID"
            );
        });

        describe("DELETE method", () => {
            it.todo(
                "should delete the course with the given ID when given proper user authentication"
            );

            it.todo("should have successfully deleted the course");

            it.todo(
                "should return a 401 error if no authentication is provided"
            );

            it.todo(
                "should return a 403 error if the authenticating user did not create the course to be deleted"
            );

            it.todo(
                "should return a 404 error if no course exists with the given ID"
            );
        });
    });
});
