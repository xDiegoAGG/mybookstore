import { CartItem } from "./CartItem.js";

export class Cart {
  constructor({ userId, items = [] }) {
    this.userId = userId;
    this.items = items.map((i) => (i instanceof CartItem ? i : new CartItem(i)));
  }

  addItem(item) {
    const existing = this.items.find((i) => i.bookId === item.bookId);
    if (existing) {
      existing.qty += item.qty;
    } else {
      this.items.push(item);
    }
  }

  removeItem(bookId) {
    this.items = this.items.filter((i) => i.bookId !== bookId);
  }
}
