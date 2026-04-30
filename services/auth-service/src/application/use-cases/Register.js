import { randomUUID } from "crypto";
import { Credential } from "../../domain/entities/Credential.js";
import { EmailAlreadyExistsError } from "../../domain/errors/EmailAlreadyExistsError.js";

export class Register {
  constructor({ credentialRepository, passwordHasher }) {
    this.repo = credentialRepository;
    this.hasher = passwordHasher;
  }

  async execute({ email, password }) {
    const existing = await this.repo.findByEmail(email);
    if (existing) throw new EmailAlreadyExistsError(email);

    const passwordHash = await this.hasher.hash(password);
    const credential = new Credential({
      id: randomUUID(),
      email,
      passwordHash,
      createdAt: new Date(),
    });

    return this.repo.create(credential);
  }
}
