import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from '../../../../database/index';

let connection: Connection;

describe("Create User Controller",() => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.dropDatabase();
    await connection.runMigrations();
  });

  afterAll(async () => {
      await connection.close();
  });

  it("should be able to create user and return 201", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        email: "user@test.com",
        name: "Name Test",
        password: "1234",
      });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new user with email already in use and return 400", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        email: "user@test.com",
        name: "Name Test",
        password: "1234",
      });

    const response = await request(app)
      .post("/api/v1/users")
      .send({
        email: "user@test.com",
        name: "Name Test2",
        password: "4321",
      });

    expect(response.status).toBe(400);
  });
});
