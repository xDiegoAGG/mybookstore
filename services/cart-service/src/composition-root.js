import { docClient } from "./infrastructure/config/dynamo.js";
import { DynamoCartRepository } from "./infrastructure/outbound/persistence/DynamoCartRepository.js";
import { CatalogGrpcClient } from "./infrastructure/outbound/grpc-clients/CatalogGrpcClient.js";
import { GetCart } from "./application/use-cases/GetCart.js";
import { AddItem } from "./application/use-cases/AddItem.js";
import { RemoveItem } from "./application/use-cases/RemoveItem.js";

const tableName = process.env.CARTS_TABLE || "tb_carts";
const catalogUrl = process.env.CATALOG_GRPC_URL || "localhost:50053";

const cartRepository = new DynamoCartRepository({ docClient, tableName });
const catalogService = new CatalogGrpcClient({ url: catalogUrl });

export const useCases = {
  getCart: new GetCart({ cartRepository }),
  addItem: new AddItem({ cartRepository, catalogService }),
  removeItem: new RemoveItem({ cartRepository }),
};
