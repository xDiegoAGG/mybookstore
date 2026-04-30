export class CartItem {
  constructor({ bookId, qty, name, price }) {
    this.bookId = bookId;
    this.qty = qty;
    this.name = name;
    this.price = price;
  }
}
