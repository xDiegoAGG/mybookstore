export class UserProfileRepository {
  async findByUserId(_userId) {
    throw new Error("UserProfileRepository.findByUserId not implemented");
  }

  async upsert(_profile) {
    throw new Error("UserProfileRepository.upsert not implemented");
  }
}
