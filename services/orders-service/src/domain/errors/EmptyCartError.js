export class EmptyCartError extends Error {
  constructor() {
    super("Cannot create an order from an empty cart");
    this.name = "EmptyCartError";
  }
}
