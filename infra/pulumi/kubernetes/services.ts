import * as pulumi from "@pulumi/pulumi";

export interface ServiceSpec {
  name: string;
  httpPort: number;
  grpcPort?: number;
  needsAws: boolean;
  needsJwt: boolean;
  configMapKeys: string[];
  secretKeysFromAppSecrets: { envVar: string; secretKey: string }[];
}


export const services: ServiceSpec[] = [
  {
    name: "auth-service",
    httpPort: 3001,
    needsAws: false,
    needsJwt: false,
    configMapKeys: [],
    secretKeysFromAppSecrets: [
      { envVar: "JWT_SECRET", secretKey: "JWT_SECRET" },
      { envVar: "DATABASE_URL", secretKey: "AUTH_DATABASE_URL" },
    ],
  },
  {
    name: "users-service",
    httpPort: 3002,
    grpcPort: 50052,
    needsAws: false,
    needsJwt: false,
    configMapKeys: [],
    secretKeysFromAppSecrets: [
      { envVar: "JWT_SECRET", secretKey: "JWT_SECRET" },
      { envVar: "DATABASE_URL", secretKey: "USERS_DATABASE_URL" },
    ],
  },
  {
    name: "catalog-service",
    httpPort: 3003,
    grpcPort: 50053,
    needsAws: true,
    needsJwt: false,
    configMapKeys: ["AWS_REGION", "BOOKS_TABLE"],
    secretKeysFromAppSecrets: [],
  },
  {
    name: "reviews-service",
    httpPort: 3004,
    needsAws: true,
    needsJwt: true,
    configMapKeys: ["AWS_REGION", "REVIEWS_TABLE", "USERS_GRPC_URL"],
    secretKeysFromAppSecrets: [
      { envVar: "JWT_SECRET", secretKey: "JWT_SECRET" },
    ],
  },
  {
    name: "cart-service",
    httpPort: 3005,
    grpcPort: 50055,
    needsAws: true,
    needsJwt: true,
    configMapKeys: ["AWS_REGION", "CARTS_TABLE", "CATALOG_GRPC_URL"],
    secretKeysFromAppSecrets: [
      { envVar: "JWT_SECRET", secretKey: "JWT_SECRET" },
    ],
  },
  {
    name: "orders-service",
    httpPort: 3006,
    needsAws: true,
    needsJwt: true,
    configMapKeys: [
      "AWS_REGION",
      "ORDERS_TABLE",
      "CATALOG_GRPC_URL",
      "CART_GRPC_URL",
    ],
    secretKeysFromAppSecrets: [
      { envVar: "JWT_SECRET", secretKey: "JWT_SECRET" },
    ],
  },
];
