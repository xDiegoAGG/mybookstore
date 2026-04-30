import { pool } from "./infrastructure/config/postgres.js";
import { PostgresUserProfileRepository } from "./infrastructure/outbound/persistence/PostgresUserProfileRepository.js";
import { GetUser } from "./application/use-cases/GetUser.js";
import { UpsertProfile } from "./application/use-cases/UpsertProfile.js";

const userProfileRepository = new PostgresUserProfileRepository({ pool });

export async function bootstrap() {
  await userProfileRepository.ensureSchema();
}

export const useCases = {
  getUser: new GetUser({ userProfileRepository }),
  upsertProfile: new UpsertProfile({ userProfileRepository }),
};
