import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDbClient } from "./src/infrastructure/config/dynamo.js";

const TABLE = process.env.REVIEWS_TABLE || "tb_reviews";

async function main() {
  try {
    await dynamoDbClient.send(
      new CreateTableCommand({
        TableName: TABLE,
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        BillingMode: "PAY_PER_REQUEST",
      })
    );
    console.log(`Created table ${TABLE}`);
  } catch (err) {
    if (err.name === "ResourceInUseException") {
      console.log(`Table ${TABLE} already exists`);
      return;
    }
    throw err;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
