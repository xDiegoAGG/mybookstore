export class TokenSigner {
  sign(_payload) {
    throw new Error("TokenSigner.sign not implemented");
  }

  verify(_token) {
    throw new Error("TokenSigner.verify not implemented");
  }
}
