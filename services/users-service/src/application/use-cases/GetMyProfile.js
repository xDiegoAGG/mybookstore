import { UserProfile } from "../../domain/entities/UserProfile.js";

export class GetMyProfile {
  constructor({ userProfileRepository }) {
    this.repo = userProfileRepository;
  }

  async execute({ userId, email }) {
    const profile = await this.repo.findByUserId(userId);
    return profile ?? new UserProfile({ userId, email });
  }
}
