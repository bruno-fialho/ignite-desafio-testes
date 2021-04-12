import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { CreateTransferError } from "./CreateTransferError";
import { OperationType } from "../../entities/Statement";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createTransferUseCase: CreateTransferUseCase;


describe("Create Transfer", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase= new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createTransferUseCase= new CreateTransferUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  })

  it("should be able to create a transfer", async () => {
    const sender: ICreateUserDTO = {
      email: "sender@test.com",
      name: "Sender Test",
      password: "1234",
    };

    const receiver: ICreateUserDTO = {
      email: "receiver@test.com",
      name: "Receiver Test",
      password: "1234",
    };

    const senderUser = await createUserUseCase.execute(sender);
    const receiverUser = await createUserUseCase.execute(receiver);

    const senderId = senderUser.id as string;
    const receiverId = receiverUser.id as string;

    await createStatementUseCase.execute({
      user_id: senderId,
      type: "deposit" as OperationType,
      amount: 200.00,
      description: "Test Deposit",
    });

    const transfer = await createTransferUseCase.execute({
      user_id: receiverId,
      sender_id: senderId,
      type: "transfer" as OperationType,
      amount: 100.00,
      description: "Test Transfer",
    });

    expect(transfer).toHaveProperty("id");
  });

  it("should not be able to create a transfer if receiver user does not exists", async () => {
    const sender: ICreateUserDTO = {
      email: "sender@test.com",
      name: "Sender Test",
      password: "1234",
    };

    const senderUser = await createUserUseCase.execute(sender);

    const senderId = senderUser.id as string;

    await createStatementUseCase.execute({
      user_id: senderId,
      type: "deposit" as OperationType,
      amount: 200.00,
      description: "Test Deposit",
    });

    await expect(
      createTransferUseCase.execute({
        user_id: "NonExistentUser",
        sender_id: senderId,
        type: "transfer" as OperationType,
        amount: 100.00,
        description: "Test Transfer",
      })
    ).rejects.toEqual(new CreateTransferError.ReceiverNotFound());
  });

  it("should not be able to create a transfer if sender user does not exists", async () => {
    const receiver: ICreateUserDTO = {
      email: "receiver@test.com",
      name: "Receiver Test",
      password: "1234",
    };

    const receiverUser = await createUserUseCase.execute(receiver);

    const receiverId = receiverUser.id as string;

    await expect(
      createTransferUseCase.execute({
        user_id: receiverId,
        sender_id: "NonExistentUser",
        type: "transfer" as OperationType,
        amount: 100.00,
        description: "Test Transfer",
      })
    ).rejects.toEqual(new CreateTransferError.SenderNotFound());
  });

  it("should not be able to create a transfer if sender user has no funds", async () => {
    const sender: ICreateUserDTO = {
      email: "sender@test.com",
      name: "Sender Test",
      password: "1234",
    };

    const receiver: ICreateUserDTO = {
      email: "receiver@test.com",
      name: "Receiver Test",
      password: "1234",
    };

    const senderUser = await createUserUseCase.execute(sender);
    const receiverUser = await createUserUseCase.execute(receiver);

    const senderId = senderUser.id as string;
    const receiverId = receiverUser.id as string;

    await expect(
      createTransferUseCase.execute({
        user_id: receiverId,
        sender_id: senderId,
        type: "transfer" as OperationType,
        amount: 100.00,
        description: "Test Transfer",
      })
    ).rejects.toEqual(new CreateTransferError.InsufficientFunds());
  });
})
