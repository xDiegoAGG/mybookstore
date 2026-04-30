import { InvalidCredentialsError } from "../../domain/errors/InvalidCredentialsError.js";

export class Login {
  constructor({ credentialRepository, passwordHasher, tokenSigner }) {
    this.repo = credentialRepository;
    this.hasher = passwordHasher;
    this.signer = tokenSigner;
  }

  async execute({ email, password }) {
    const cred = await this.repo.findByEmail(email);
    if (!cred) throw new InvalidCredentialsError();

    const ok = await this.hasher.compare(password, cred.passwordHash);
    if (!ok) throw new InvalidCredentialsError();

    const token = this.signer.sign({ userId: cred.id, email: cred.email });
    return { token, user: { id: cred.id, email: cred.email } };
  }
}
