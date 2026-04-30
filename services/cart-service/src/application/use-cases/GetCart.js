import { Cart } from "../../domain/entities/Cart.js";

export class GetCart {
  constructor({ cartRepository }) {
    this.repo = cartRepository;
  }

  async execute(userId) {
    const cart = await this.repo.findByUserId(userId);
    return cart || new Cart({ userId, items: [] });
  }
}
