import { docClient } from "./infrastructure/config/dynamo.js";
import { DynamoReviewRepository } from "./infrastructure/outbound/persistence/DynamoReviewRepository.js";
import { UsersGrpcClient } from "./infrastructure/outbound/grpc-clients/UsersGrpcClient.js";
import { ListReviewsForBook } from "./application/use-cases/ListReviewsForBook.js";
import { AddReview } from "./application/use-cases/AddReview.js";

const tableName = process.env.REVIEWS_TABLE || "tb_reviews";
const usersUrl = process.env.USERS_GRPC_URL || "localhost:50052";

const reviewRepository = new DynamoReviewRepository({ docClient, tableName });
const usersService = new UsersGrpcClient({ url: usersUrl });

export const useCases = {
  listReviewsForBook: new ListReviewsForBook({ reviewRepository, usersService }),
  addReview: new AddReview({ reviewRepository, usersService }),
};
