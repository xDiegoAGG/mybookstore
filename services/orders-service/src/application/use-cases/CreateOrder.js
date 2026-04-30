import { randomUUID } from "crypto";
import { Order } from "../../domain/entities/Order.js";
import { EmptyCartError } from "../../domain/errors/EmptyCartError.js";

const parsePrice = (raw) => {
  const num = Number(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : 0;
};

export class CreateOrder {
  constructor({ orderRepository, cartService, catalogService }) {
    this.repo = orderRepository;
    this.cartService = cartService;
    this.catalog = catalogService;
  }

  async execute({ userId }) {
    const cart = await this.cartService.getCart(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new EmptyCartError();
    }

    const items = [];
    let total = 0;

    for (const cartItem of cart.items) {
      const book = await this.catalog.getBook(cartItem.bookId);
      const unitPrice = book ? parsePrice(book.price) : parsePrice(cartItem.price);
      const subtotal = unitPrice * cartItem.qty;
      total += subtotal;
      items.push({
        bookId: cartItem.bookId,
        name: book?.name || cartItem.name,
        unitPrice,
        qty: cartItem.qty,
        subtotal,
      });
    }

    const order = new Order({
      id: randomUUID(),
      userId,
      items,
      total: Number(total.toFixed(2)),
      createdAt: new Date().toISOString(),
    });

    return this.repo.create(order);
  }
}
