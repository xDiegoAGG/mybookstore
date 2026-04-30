import bcrypt from "bcryptjs";
import { PasswordHasher } from "../../../application/ports/out/PasswordHasher.js";

export class BcryptPasswordHasher extends PasswordHasher {
  constructor({ rounds = 10 } = {}) {
    super();
    this.rounds = rounds;
  }

  async hash(plain) {
    return bcrypt.hash(plain, this.rounds);
  }

  async compare(plain, hash) {
    return bcrypt.compare(plain, hash);
  }
}
