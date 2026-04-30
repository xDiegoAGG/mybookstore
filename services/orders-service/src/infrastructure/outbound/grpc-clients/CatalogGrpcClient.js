import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { CatalogService } from "../../../application/ports/out/CatalogService.js";
import { getProtoPath } from "../../grpc/proto-path.js";

const PROTO_PATH = getProtoPath("catalog.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const catalogProto = grpc.loadPackageDefinition(packageDef).catalog;

export class CatalogGrpcClient extends CatalogService {
  constructor({ url }) {
    super();
    this.client = new catalogProto.CatalogService(
      url,
      grpc.credentials.createInsecure()
    );
  }

  getBook(bookId) {
    return new Promise((resolve, reject) => {
      this.client.GetBook({ id: bookId }, (err, response) => {
        if (err) {
          if (err.code === grpc.status.NOT_FOUND) return resolve(null);
          return reject(err);
        }
        resolve(response);
      });
    });
  }
}
