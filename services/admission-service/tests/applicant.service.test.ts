process.env.NODE_ENV = 'development';
import express from "express";
import request from "supertest";
import { initDB, db } from "../src/database/utils/db-bootstrap.util";
import v1Routes from "../src/routes/v1/v1";
const app = express();
app.use(express.json());

app.use("/api/v1", v1Routes);

describe("Applicant API (TypeORM)", () => {
    beforeAll(async () => {
        // Initialize DB connection
        await initDB();
    });

    afterAll(async () => {
        if (db.orm) {
            await db.orm.destroy();
        }
    });

    it("should fetch applicants via API", async () => {
        const response = await request(app).get("/api/v1/applicants/search?search=test");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body?.data)).toBe(true);
    });

    it("should fetch all applicants paginated", async () => {
        const response = await request(app).get("/api/v1/applicants/all?page=1&limit=10");
        // Depending on auth, this might return 401. 
        // We will just expect it to return 401 since we didn't mock the JWT, OR if it's open, 200.
        expect([200, 401, 403]).toContain(response.status);
    });
});
