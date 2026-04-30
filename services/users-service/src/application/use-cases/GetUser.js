import { UserNotFoundError } from "../../domain/errors/UserNotFoundError.js";

export class GetUser {
  constructor({ userProfileRepository }) {
    this.repo = userProfileRepository;
  }

  async execute(userId) {
    const profile = await this.repo.findByUserId(userId);
    if (!profile) throw new UserNotFoundError(userId);
    return profile;
  }
}
