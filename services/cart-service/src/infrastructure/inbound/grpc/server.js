import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { getProtoPath } from "../../grpc/proto-path.js";

const PROTO_PATH = getProtoPath("cart.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const cartProto = grpc.loadPackageDefinition(packageDef).cart;

const toGrpcCart = (cart) => ({
  userId: String(cart.userId ?? ""),
  items: (cart.items || []).map((i) => ({
    bookId: String(i.bookId ?? ""),
    qty: Number(i.qty ?? 0),
    name: String(i.name ?? ""),
    price: String(i.price ?? ""),
  })),
});

export function startGrpcServer({ getCart, port }) {
  const server = new grpc.Server();

  server.addService(cartProto.CartService.service, {
    GetCart: async (call, callback) => {
      try {
        const cart = await getCart.execute(call.request.userId);
        callback(null, toGrpcCart(cart));
      } catch (err) {
        callback(err);
      }
    },
  });

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err) => {
      if (err) {
        console.error("gRPC bind failed", err);
        return;
      }
      console.log(`gRPC server listening on ${port}`);
    }
  );

  return server;
}
