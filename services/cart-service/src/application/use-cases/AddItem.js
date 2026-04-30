import { Cart } from "../../domain/entities/Cart.js";
import { CartItem } from "../../domain/entities/CartItem.js";
import { BookNotFoundError } from "../../domain/errors/BookNotFoundError.js";

export class AddItem {
  constructor({ cartRepository, catalogService }) {
    this.repo = cartRepository;
    this.catalog = catalogService;
  }

  async execute({ userId, bookId, qty }) {
    const book = await this.catalog.getBook(bookId);
    if (!book) throw new BookNotFoundError(bookId);

    const cart =
      (await this.repo.findByUserId(userId)) || new Cart({ userId, items: [] });

    cart.addItem(
      new CartItem({
        bookId: book.id,
        qty: Number(qty) || 1,
        name: book.name,
        price: book.price,
      })
    );

    await this.repo.save(cart);
    return cart;
  }
}
