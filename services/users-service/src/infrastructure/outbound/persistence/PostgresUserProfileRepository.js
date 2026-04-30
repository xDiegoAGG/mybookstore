import { UserProfileRepository } from "../../../application/ports/out/UserProfileRepository.js";
import { UserProfile } from "../../../domain/entities/UserProfile.js";

export class PostgresUserProfileRepository extends UserProfileRepository {
  constructor({ pool }) {
    super();
    this.pool = pool;
  }

  async ensureSchema() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        name TEXT,
        address TEXT,
        email TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }

  async findByUserId(userId) {
    const result = await this.pool.query(
      "SELECT user_id, name, address, email FROM user_profiles WHERE user_id = $1",
      [userId]
    );
    if (result.rowCount === 0) return null;
    const row = result.rows[0];
    return new UserProfile({
      userId: row.user_id,
      name: row.name,
      address: row.address,
      email: row.email,
    });
  }

  async upsert(profile) {
    await this.pool.query(
      `INSERT INTO user_profiles (user_id, name, address, email, updated_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (user_id) DO UPDATE
       SET name = EXCLUDED.name,
           address = EXCLUDED.address,
           email = EXCLUDED.email,
           updated_at = now()`,
      [profile.userId, profile.name, profile.address, profile.email]
    );
    return profile;
  }
}
