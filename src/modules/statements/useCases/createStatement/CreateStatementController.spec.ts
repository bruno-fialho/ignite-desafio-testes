import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from '../../../../database/index';

let connection: Connection;

describe("Create Statement Controller",() => {
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

  it("should be able to create a deposit and return 201", async () => {
    const responseToken = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "user@test.com",
      password: "1234",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100.00,
        description: "Deposit Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a deposit if user does not exists and return 401", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100.00,
        description: "Deposit Test",
      })
      .set({
        Authorization: `Bearer invalid-token`,
      });

    expect(response.status).toBe(401);
  });

  it("should be able to create a withdraw and return 201", async () => {
    const responseToken = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "user@test.com",
      password: "1234",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200.00,
        description: "Deposit Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100.00,
        description: "Withdraw Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a withdraw without funds and return 400", async () => {
    const responseToken = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "user@test.com",
      password: "1234",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 900.00,
        description: "Withdraw Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
})
