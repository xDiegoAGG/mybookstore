export class PasswordHasher {
  async hash(_plain) {
    throw new Error("PasswordHasher.hash not implemented");
  }

  async compare(_plain, _hash) {
    throw new Error("PasswordHasher.compare not implemented");
  }
}
