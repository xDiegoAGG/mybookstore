export class Credential {
  constructor({ id, email, passwordHash, createdAt }) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
  }
}
