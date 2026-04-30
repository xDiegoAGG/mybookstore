import { CredentialRepository } from "../../../application/ports/out/CredentialRepository.js";
import { Credential } from "../../../domain/entities/Credential.js";

export class PostgresCredentialRepository extends CredentialRepository {
  constructor({ pool }) {
    super();
    this.pool = pool;
  }

  async ensureSchema() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS credentials (
        id UUID PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }

  async findByEmail(email) {
    const result = await this.pool.query(
      "SELECT id, email, password_hash, created_at FROM credentials WHERE email = $1",
      [email]
    );
    if (result.rowCount === 0) return null;
    const row = result.rows[0];
    return new Credential({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    });
  }

  async create(credential) {
    await this.pool.query(
      "INSERT INTO credentials (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)",
      [credential.id, credential.email, credential.passwordHash, credential.createdAt]
    );
    return credential;
  }
}
