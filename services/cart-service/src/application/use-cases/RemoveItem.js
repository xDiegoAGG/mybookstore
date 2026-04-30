import { Cart } from "../../domain/entities/Cart.js";

export class RemoveItem {
  constructor({ cartRepository }) {
    this.repo = cartRepository;
  }

  async execute({ userId, bookId }) {
    const cart =
      (await this.repo.findByUserId(userId)) || new Cart({ userId, items: [] });
    cart.removeItem(bookId);
    await this.repo.save(cart);
    return cart;
  }
}
