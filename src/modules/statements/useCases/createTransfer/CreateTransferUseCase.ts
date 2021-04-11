import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";


@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, sender_id, type, amount, description }: ICreateTransferDTO) {
    const receiverUser = await this.usersRepository.findById(user_id);

    if(!receiverUser) {
      throw new CreateTransferError.ReceiverNotFound();
    }

    const senderUser = await this.usersRepository.findById(String(sender_id));

    if(!senderUser) {
      throw new CreateTransferError.SenderNotFound();
    }

    const id = String(sender_id);

    const { balance } = await this.statementsRepository.getUserBalance({ id });

    if (balance < amount) {
      throw new CreateTransferError.InsufficientFunds()
    }

    const statementOperation = await this.statementsRepository.createTransfer({
      user_id,
      sender_id,
      type,
      amount,
      description
    });

    return statementOperation;
  }
}
