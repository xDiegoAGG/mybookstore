const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE = process.env.BOOKS_TABLE || "tb_books";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

function parseNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}


function parsePriceLikeNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;

  let cleaned = String(value).replace(/[^0-9.,]/g, "");
  if (!cleaned) return undefined;


  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",") && !cleaned.includes(".")) {
    cleaned = cleaned.replace(",", ".");
  }

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

exports.handler = async (event) => {
  try {
    const qs = event?.queryStringParameters || {};
    const q = normalize(qs.q);
    const author = normalize(qs.author);
    const minPrice = parseNumber(qs.minPrice);
    const maxPrice = parseNumber(qs.maxPrice);


    const items = [];
    let lastKey = undefined;
    do {
      const res = await ddb.send(new ScanCommand({
        TableName: TABLE,
        ExclusiveStartKey: lastKey,
      }));
      if (res.Items) items.push(...res.Items);
      lastKey = res.LastEvaluatedKey;
    } while (lastKey);

    const filtered = items.filter((book) => {
      if (q) {
        const name = normalize(book.name);
        const desc = normalize(book.description);
        if (!name.includes(q) && !desc.includes(q)) return false;
      }
      if (author && !normalize(book.author).includes(author)) return false;

      const price = parsePriceLikeNumber(book.price);
      if (minPrice !== undefined && (price === undefined || price < minPrice)) return false;
      if (maxPrice !== undefined && (price === undefined || price > maxPrice)) return false;

      return true;
    });

    return jsonResponse(200, {
      count: filtered.length,
      filters: { q: qs.q || null, author: qs.author || null, minPrice: minPrice ?? null, maxPrice: maxPrice ?? null },
      items: filtered,
    });
  } catch (err) {
    console.error("search-books error:", err);
    return jsonResponse(500, { message: "Internal Server Error", error: String(err?.message || err) });
  }
};
