import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from '../../../../database/index';

let connection: Connection;

describe("Authenticate User Controller",() => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.dropDatabase();
    await connection.runMigrations();
  });

  afterAll(async () => {
      await connection.close();
  });

  it("should be able to authenticate user and return 200", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        email: "user@test.com",
        name: "Name Test",
        password: "1234",
      });

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@test.com",
        password: "1234",
      });


    expect(response.status).toBe(200);
  });

  it("should not be able to authenticate user with invalid password and return 401", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        email: "user@test.com",
        name: "Name Test",
        password: "1234",
      });

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@test.com",
        password: "invalid-password",
      });


    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate non existent user and return 401", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "non-existent-user@test.com",
        password: "1234",
      });


    expect(response.status).toBe(401);
  });
});
