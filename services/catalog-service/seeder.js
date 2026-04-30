import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, dynamoDbClient } from "./src/infrastructure/config/dynamo.js";

const TABLE = process.env.BOOKS_TABLE || "tb_books";

const sampleBooks = [
  {
    id: "1",
    name: "Cien años de soledad",
    author: "Gabriel García Márquez",
    description: "La saga de la familia Buendía en Macondo.",
    price: "$18.99",
    countInStock: 12,
    image: "https://picsum.photos/seed/book1/400/600",
  },
  {
    id: "2",
    name: "El nombre del viento",
    author: "Patrick Rothfuss",
    description: "Primera parte de la Crónica del Asesino de Reyes.",
    price: "$22.50",
    countInStock: 5,
    image: "https://picsum.photos/seed/book2/400/600",
  },
  {
    id: "3",
    name: "Fundación",
    author: "Isaac Asimov",
    description: "El plan de Hari Seldon ante el declive del Imperio Galáctico.",
    price: "$16.00",
    countInStock: 0,
    image: "https://picsum.photos/seed/book3/400/600",
  },
  {
    id: "4",
    name: "El Hobbit",
    author: "J.R.R. Tolkien",
    description: "La aventura de Bilbo Bolsón hacia la Montaña Solitaria.",
    price: "$15.00",
    countInStock: 20,
    image: "https://picsum.photos/seed/book4/400/600",
  },
];

async function ensureTable() {
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

async function seed() {
  await ensureTable();
  for (const book of sampleBooks) {
    await docClient.send(new PutCommand({ TableName: TABLE, Item: book }));
    console.log(`Upserted ${book.id} - ${book.name}`);
  }
  console.log(`Seeded ${sampleBooks.length} books in ${TABLE}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
