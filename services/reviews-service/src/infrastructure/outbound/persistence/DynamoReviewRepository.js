import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ReviewRepository } from "../../../application/ports/out/ReviewRepository.js";
import { Review } from "../../../domain/entities/Review.js";

export class DynamoReviewRepository extends ReviewRepository {
  constructor({ docClient, tableName }) {
    super();
    this.docClient = docClient;
    this.tableName = tableName;
  }

  async findByBookId(bookId) {
    const result = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "bookId = :b",
        ExpressionAttributeValues: { ":b": bookId },
      })
    );
    return (result.Items || []).map((i) => new Review(i));
  }

  async create(review) {
    await this.docClient.send(
      new PutCommand({ TableName: this.tableName, Item: { ...review } })
    );
    return review;
  }
}
