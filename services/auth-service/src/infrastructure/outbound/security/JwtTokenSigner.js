import jwt from "jsonwebtoken";
import { TokenSigner } from "../../../application/ports/out/TokenSigner.js";

export class JwtTokenSigner extends TokenSigner {
  constructor({ secret, expiresIn = "1h" }) {
    super();
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token) {
    return jwt.verify(token, this.secret);
  }
}
