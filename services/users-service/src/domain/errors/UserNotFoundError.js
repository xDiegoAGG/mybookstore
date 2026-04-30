export class UserNotFoundError extends Error {
  constructor(userId) {
    super(`User ${userId} not found`);
    this.name = "UserNotFoundError";
  }
}
