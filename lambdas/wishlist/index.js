const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE = process.env.WISHLISTS_TABLE || "tb_wishlists";
const GSI_BY_USER = process.env.WISHLISTS_GSI || "byUserId";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    },
    body: JSON.stringify(body),
  };
}


function verifyJwt(event) {
  const headers = event?.headers || {};
  const auth = headers.authorization || headers.Authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return { error: "Missing token" };
  }
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    if (!decoded?.userId) return { error: "Invalid token (no userId)" };
    return { user: decoded };
  } catch (err) {
    return { error: "Invalid token" };
  }
}

function getMethod(event) {

  return event?.requestContext?.http?.method
      || event?.httpMethod
      || event?.requestContext?.httpMethod
      || "";
}

function getPath(event) {
  return event?.rawPath || event?.path || "";
}

function parseBody(event) {
  if (!event?.body) return {};
  try {
    return typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  } catch {
    return {};
  }
}

function getBookIdFromPath(event) {

  const params = event?.pathParameters || {};
  if (params.bookId) return params.bookId;
  const path = getPath(event);
  const m = path.match(/\/api\/wishlist\/(?:items\/)?([^/?]+)\/?$/);
  return m ? decodeURIComponent(m[1]) : null;
}

async function listWishlist(userId) {
  const res = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: GSI_BY_USER,
    KeyConditionExpression: "userId = :u",
    ExpressionAttributeValues: { ":u": userId },
  }));
  return res.Items || [];
}

async function addToWishlist(userId, bookId, extra = {}) {
  const item = {
    id: `${userId}#${bookId}`,
    userId,
    bookId,
    name: extra.name || null,
    price: extra.price ?? null,
    image: extra.image || null,
    addedAt: new Date().toISOString(),
  };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
}

async function removeFromWishlist(userId, bookId) {
  await ddb.send(new DeleteCommand({
    TableName: TABLE,
    Key: { id: `${userId}#${bookId}` },
  }));
}


exports.handler = async (event) => {
  try {
    const method = getMethod(event).toUpperCase();

    if (method === "OPTIONS") return jsonResponse(204, {});

    const auth = verifyJwt(event);
    if (auth.error) return jsonResponse(401, { message: auth.error });
    const userId = auth.user.userId;

    if (method === "GET") {
      const items = await listWishlist(userId);
      return jsonResponse(200, { count: items.length, items });
    }

    if (method === "POST") {
      const body = parseBody(event);
      if (!body.bookId) return jsonResponse(400, { message: "bookId is required" });
      const item = await addToWishlist(userId, body.bookId, {
        name: body.name,
        price: body.price,
        image: body.image,
      });
      return jsonResponse(201, item);
    }

    if (method === "DELETE") {
      const bookId = getBookIdFromPath(event);
      if (!bookId) return jsonResponse(400, { message: "bookId is required in path" });
      await removeFromWishlist(userId, bookId);
      return jsonResponse(204, {});
    }

    return jsonResponse(405, { message: `Method ${method} not allowed` });
  } catch (err) {
    console.error("wishlist error:", err);
    return jsonResponse(500, { message: "Internal Server Error", error: String(err?.message || err) });
  }
};
