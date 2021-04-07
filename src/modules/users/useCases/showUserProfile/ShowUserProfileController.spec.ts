import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from '../../../../database/index';

let connection: Connection;

describe("Show User Profile Controller",() => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.dropDatabase();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("1234", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${id}', 'test', 'user@test.com', '${password}', 'now()', 'now()')
      `
    );
  });

  afterAll(async () => {
      await connection.close();
  });

  it("should be able to show user profile and return 200", async () => {
    const responseToken = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "user@test.com",
      password: "1234",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });

  it("should not be able to show user profile if user does not exists and return 401", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer invalid-token`,
      });

    expect(response.status).toBe(401);
  });
});
