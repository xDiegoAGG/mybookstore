import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { getProtoPath } from "./proto-path.js";
import { UserNotFoundError } from "../../../domain/errors/UserNotFoundError.js";

const PROTO_PATH = getProtoPath("users.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const usersProto = grpc.loadPackageDefinition(packageDef).users;

const toGrpcUser = (profile) => ({
  userId: String(profile.userId ?? ""),
  name: String(profile.name ?? ""),
  address: String(profile.address ?? ""),
  email: String(profile.email ?? ""),
});

export function startGrpcServer({ getUser, port }) {
  const server = new grpc.Server();

  server.addService(usersProto.UsersService.service, {
    GetUser: async (call, callback) => {
      try {
        const profile = await getUser.execute(call.request.userId);
        callback(null, toGrpcUser(profile));
      } catch (err) {
        if (err instanceof UserNotFoundError) {
          return callback({
            code: grpc.status.NOT_FOUND,
            message: err.message,
          });
        }
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
