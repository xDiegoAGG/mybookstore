import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { CartService } from "../../../application/ports/out/CartService.js";
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

export class CartGrpcClient extends CartService {
  constructor({ url }) {
    super();
    this.client = new cartProto.CartService(
      url,
      grpc.credentials.createInsecure()
    );
  }

  getCart(userId) {
    return new Promise((resolve, reject) => {
      this.client.GetCart({ userId }, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
    });
  }
}
