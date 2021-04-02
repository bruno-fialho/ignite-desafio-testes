import { AppError } from "../../../../shared/errors/AppError";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("should be able to show user profile", async () => {
    const user: ICreateUserDTO = {
      email: "user@test.com",
      name: "Name Test",
      password: "1234",
    };

    const createdUser = await createUserUseCase.execute(user);

    const userId = createdUser.id as string;

    const userProfile = await showUserProfileUseCase.execute(userId);

    expect(userProfile).toHaveProperty("id");
  });

  it("should not be able to show user profile if user does not exists", () => {
    expect(async () => {
      const userId = "NonExistentUser";

      await showUserProfileUseCase.execute(userId);
    }).rejects.toBeInstanceOf(AppError);
  });
})