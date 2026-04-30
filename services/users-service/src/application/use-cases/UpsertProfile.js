import { UserProfile } from "../../domain/entities/UserProfile.js";

export class UpsertProfile {
  constructor({ userProfileRepository }) {
    this.repo = userProfileRepository;
  }

  async execute({ userId, name, address, email }) {
    const profile = new UserProfile({ userId, name, address, email });
    return this.repo.upsert(profile);
  }
}
