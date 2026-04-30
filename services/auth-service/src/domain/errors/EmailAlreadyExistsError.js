export class EmailAlreadyExistsError extends Error {
  constructor(email) {
    super(`Email ${email} already exists`);
    this.name = "EmailAlreadyExistsError";
  }
}
