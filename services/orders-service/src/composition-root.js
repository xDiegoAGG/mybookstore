import { docClient } from "./infrastructure/config/dynamo.js";
import { DynamoOrderRepository } from "./infrastructure/outbound/persistence/DynamoOrderRepository.js";
import { CatalogGrpcClient } from "./infrastructure/outbound/grpc-clients/CatalogGrpcClient.js";
import { CartGrpcClient } from "./infrastructure/outbound/grpc-clients/CartGrpcClient.js";
import { CreateOrder } from "./application/use-cases/CreateOrder.js";
import { ListMyOrders } from "./application/use-cases/ListMyOrders.js";

const tableName = process.env.ORDERS_TABLE || "tb_orders";
const catalogUrl = process.env.CATALOG_GRPC_URL || "localhost:50053";
const cartUrl = process.env.CART_GRPC_URL || "localhost:50055";

const orderRepository = new DynamoOrderRepository({ docClient, tableName });
const catalogService = new CatalogGrpcClient({ url: catalogUrl });
const cartService = new CartGrpcClient({ url: cartUrl });

export const useCases = {
  createOrder: new CreateOrder({ orderRepository, cartService, catalogService }),
  listMyOrders: new ListMyOrders({ orderRepository }),
};
