import { InvalidCredentialsError } from "../../domain/errors/InvalidCredentialsError.js";

export class VerifyToken {
  constructor({ tokenSigner }) {
    this.signer = tokenSigner;
  }

  execute(token) {
    try {
      return this.signer.verify(token);
    } catch (_err) {
      throw new InvalidCredentialsError();
    }
  }
}
