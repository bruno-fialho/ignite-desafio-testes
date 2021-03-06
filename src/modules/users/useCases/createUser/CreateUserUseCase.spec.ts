import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      email: "user@test.com",
      name: "Name Test",
      password: "1234",
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a new user with email already in use", async () => {
    await createUserUseCase.execute({
      email: "user@test.com",
      name: "Name Test",
      password: "1234",
    });

    expect(
      createUserUseCase.execute({
        email: "user@test.com",
        name: "Name Test2",
        password: "0000",
      })
    ).rejects.toEqual(new CreateUserError());
  });
});
