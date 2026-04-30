import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { CartRepository } from "../../../application/ports/out/CartRepository.js";
import { Cart } from "../../../domain/entities/Cart.js";

export class DynamoCartRepository extends CartRepository {
  constructor({ docClient, tableName }) {
    super();
    this.docClient = docClient;
    this.tableName = tableName;
  }

  async findByUserId(userId) {
    const result = await this.docClient.send(
      new GetCommand({ TableName: this.tableName, Key: { id: userId } })
    );
    if (!result.Item) return null;
    return new Cart({ userId: result.Item.id, items: result.Item.items || [] });
  }

  async save(cart) {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: { id: cart.userId, items: cart.items.map((i) => ({ ...i })) },
      })
    );
    return cart;
  }
}
