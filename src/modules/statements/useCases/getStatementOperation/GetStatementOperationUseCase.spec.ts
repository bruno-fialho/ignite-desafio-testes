import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"

import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { OperationType } from "../../entities/Statement";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;


describe("Get Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase= new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  })

  it("should be able to get a statement", async () => {
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

    const depositId = deposit.id as string;

    const getStatement = await getStatementOperationUseCase.execute({
      user_id: userId,
      statement_id: depositId,
    });

    expect(getStatement).toHaveProperty("id");
    expect(getStatement.amount).toEqual(100);
  });

  it("should not be able to get a statement with invalid statement id", async () => {
    const user: ICreateUserDTO = {
      email: "user@test.com",
      name: "Name Test",
      password: "1234",
    };

    const createdUser = await createUserUseCase.execute(user);

    const userId = createdUser.id as string;

    await expect(
      getStatementOperationUseCase.execute({
        user_id: userId,
        statement_id: "NonExistentStatement",
      })
    ).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
  });

  it("should not be able to get a statement if user does not exists", async () => {
    await expect(
      getStatementOperationUseCase.execute({
        user_id: "NonExistentUser",
        statement_id: "NonExistentStatement",
      })
    ).rejects.toEqual(new GetStatementOperationError.UserNotFound());
  });
})
