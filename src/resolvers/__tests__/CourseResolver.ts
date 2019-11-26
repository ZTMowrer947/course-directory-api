import agent from "../../koaTestAgent";
import app from "../../app";

// Test Suite
describe("Course resolver", () => {
    let id: string;
    let unusedId: string;

    // Run before all tests
    beforeAll(() => {
        // Define unused ID
        unusedId = "A".repeat(16);
    });

    describe("courses query", () => {
        it("should return a list of courses", async () => {
            // Define GraphQL query
            const query = `
                query {
                    courses {
                        id
                        title
                        description
                        estimatedTime
                        materialsNeeded
                    }
                }
            `;

            // Define request body
            const body = {
                query,
            };

            // Make request to API
            const response = await agent(app)
                .post("/gql")
                .send(body);

            // Expect a 200 response
            expect(response.status).toBe(200);

            // Expect response body to contain 3 courses
            expect(response.body.data.courses).toHaveLength(3);
        });
    });

    describe("course query", () => {
        it.todo("should return the course with the given ID, if found");
    });
});
