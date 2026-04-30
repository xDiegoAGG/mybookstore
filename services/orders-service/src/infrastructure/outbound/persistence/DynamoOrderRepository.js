import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { OrderRepository } from "../../../application/ports/out/OrderRepository.js";
import { Order } from "../../../domain/entities/Order.js";

export class DynamoOrderRepository extends OrderRepository {
  constructor({ docClient, tableName }) {
    super();
    this.docClient = docClient;
    this.tableName = tableName;
  }

  async create(order) {
    await this.docClient.send(
      new PutCommand({ TableName: this.tableName, Item: { ...order } })
    );
    return order;
  }

  async findByUserId(userId) {
    const result = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "userId = :u",
        ExpressionAttributeValues: { ":u": userId },
      })
    );
    return (result.Items || []).map((i) => new Order(i));
  }
}
