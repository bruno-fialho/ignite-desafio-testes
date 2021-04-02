import { AppError } from "../../../../shared/errors/AppError";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "./CreateStatementUseCase";

import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "./CreateStatementController";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;


describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase= new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  })

  it("should be able to create a deposit", async () => {
    const user: ICreateUserDTO = {
      email: "user@test.com",
      name: "Name Test",
      password: "1234",
    };

    const createdUser = await createUserUseCase.execute(user);

    const userId = createdUser.id as string;

    const deposit = await createStatementUseCase.execute({
      user_id: userId,
      type: "deposit" as OperationType,
      amount: 100.00,
      description: "Test Deposit",
    });

    expect(deposit).toHaveProperty("id");
  });

  it("should not be able to create a deposit if user does not exists", async () => {
    await expect(createStatementUseCase.execute({
      user_id: "NonExistentUser",
      type: "deposit" as OperationType,
      amount: 100.00,
      description: "Test Deposit",
    })).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to create a withdraw", async () => {
    const user: ICreateUserDTO = {
      email: "user@test.com",
      name: "Name Test",
      password: "1234",
    };

    const createdUser = await createUserUseCase.execute(user);

    const userId = createdUser.id as string;

    await createStatementUseCase.execute({
      user_id: userId,
      type: "deposit" as OperationType,
      amount: 200.00,
      description: "Test Deposit",
    });

    const withdraw = await createStatementUseCase.execute({
      user_id: userId,
      type: "withdraw" as OperationType,
      amount: 100.00,
      description: "Test Withdraw",
    });

    expect(withdraw).toHaveProperty("id");
  });

  it("should not be able to create a withdraw without funds", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: "user@test.com",
        name: "Name Test",
        password: "1234",
      };

      const createdUser = await createUserUseCase.execute(user);

      const userId = createdUser.id as string;

      await createStatementUseCase.execute({
        user_id: userId,
        type: "withdraw" as OperationType,
        amount: 100.00,
        description: "Test Withdraw",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to create a withdraw without funds", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: "user@test.com",
        name: "Name Test",
        password: "1234",
      };

      const createdUser = await createUserUseCase.execute(user);

      const userId = createdUser.id as string;

      await createStatementUseCase.execute({
        user_id: userId,
        type: "withdraw" as OperationType,
        amount: 100.00,
        description: "Test Withdraw",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})
