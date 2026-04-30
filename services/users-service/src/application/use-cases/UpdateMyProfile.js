import { UserProfile } from "../../domain/entities/UserProfile.js";

export class UpdateMyProfile {
  constructor({ userProfileRepository }) {
    this.repo = userProfileRepository;
  }

  async execute({ userId, email, name, address }) {
    const profile = new UserProfile({ userId, email, name, address });
    return this.repo.upsert(profile);
  }
}
