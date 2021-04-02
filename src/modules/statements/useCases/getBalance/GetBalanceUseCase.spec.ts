import { AppError } from "../../../../shared/errors/AppError";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../createStatement/CreateStatementController";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get a user's balance", async () => {
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

    await createStatementUseCase.execute({
      user_id: userId,
      type: "withdraw" as OperationType,
      amount: 100.00,
      description: "Test Withdraw",
    });

    const result = await getBalanceUseCase.execute({
      user_id: userId,
    });

    expect(result).toHaveProperty("balance");
    expect(result.balance).toEqual(100);
  });

  it("should not be able to get a balance if user does not exists", async () => {
    await expect(getBalanceUseCase.execute({
      user_id: "NonExistentUser",
    })).rejects.toBeInstanceOf(AppError);
  });
})
