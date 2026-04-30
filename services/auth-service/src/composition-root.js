import { pool } from "./infrastructure/config/postgres.js";
import { PostgresCredentialRepository } from "./infrastructure/outbound/persistence/PostgresCredentialRepository.js";
import { BcryptPasswordHasher } from "./infrastructure/outbound/security/BcryptPasswordHasher.js";
import { JwtTokenSigner } from "./infrastructure/outbound/security/JwtTokenSigner.js";
import { Register } from "./application/use-cases/Register.js";
import { Login } from "./application/use-cases/Login.js";
import { VerifyToken } from "./application/use-cases/VerifyToken.js";

const credentialRepository = new PostgresCredentialRepository({ pool });
const passwordHasher = new BcryptPasswordHasher();
const tokenSigner = new JwtTokenSigner({
  secret: process.env.JWT_SECRET || "dev-secret",
  expiresIn: process.env.JWT_EXPIRES_IN || "1h",
});

export async function bootstrap() {
  await credentialRepository.ensureSchema();
}

export const useCases = {
  register: new Register({ credentialRepository, passwordHasher }),
  login: new Login({ credentialRepository, passwordHasher, tokenSigner }),
  verifyToken: new VerifyToken({ tokenSigner }),
};
