import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from '../../../../database/index';

let connection: Connection;

describe("Create Transfer Controller",() => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.dropDatabase();
    await connection.runMigrations();

    const senderId = uuidV4();
    const receiverId = uuidV4();
    const password = await hash("1234", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${senderId}', 'test', 'sender@test.com', '${password}', 'now()', 'now()')
      `
    );

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
        values('${receiverId}', 'test', 'receiver@test.com', '${password}', 'now()', 'now()')
      `
    );
  });

  afterAll(async () => {
      await connection.close();
  });

  it("should be able to create a transfer and return 201", async () => {
    const receiver = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "receiver@test.com",
      password: "1234",
    });

    const { id: receiverId } = receiver.body.user;

    const responseToken = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "sender@test.com",
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
      .post(`/api/v1/statements/transfers/${receiverId}`)
      .send({
        amount: 100.00,
        description: "Transfer Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a transfer if receiver user does not exists and return 404", async () => {
    const responseToken = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "sender@test.com",
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

    const nonExistentUserId = uuidV4();

    const response = await request(app)
      .post(`/api/v1/statements/transfers/${nonExistentUserId}`)
      .send({
        amount: 100.00,
        description: "Transfer Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it("should not be able to create a transfer if sender user does not exists and return 404", async () => {
    const receiver = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "receiver@test.com",
      password: "1234",
    });

    const { id: receiverId } = receiver.body.user;

    const response = await request(app)
      .post(`/api/v1/statements/transfers/${receiverId}`)
      .send({
        amount: 100.00,
        description: "Transfer Test",
      })
      .set({
        Authorization: `Bearer invalid-token`,
      });

    expect(response.status).toBe(401);
  });

  it("should not be able to create a transfer if sender user has no funds and return 400", async () => {
    const receiver = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "receiver@test.com",
      password: "1234",
    });

    const { id: receiverId } = receiver.body.user;

    const responseToken = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "sender@test.com",
      password: "1234",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post(`/api/v1/statements/transfers/${receiverId}`)
      .send({
        amount: 900.00,
        description: "Transfer Test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
})
