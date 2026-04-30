import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { UsersService } from "../../../application/ports/out/UsersService.js";
import { getProtoPath } from "../../grpc/proto-path.js";

const PROTO_PATH = getProtoPath("users.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const usersProto = grpc.loadPackageDefinition(packageDef).users;

export class UsersGrpcClient extends UsersService {
  constructor({ url }) {
    super();
    this.client = new usersProto.UsersService(
      url,
      grpc.credentials.createInsecure()
    );
  }

  getUser(userId) {
    return new Promise((resolve, reject) => {
      this.client.GetUser({ userId }, (err, response) => {
        if (err) {
          if (err.code === grpc.status.NOT_FOUND) return resolve(null);
          return reject(err);
        }
        resolve(response);
      });
    });
  }
}
