export class Order {
  constructor({ id, userId, items, total, createdAt }) {
    this.id = id;
    this.userId = userId;
    this.items = items;
    this.total = total;
    this.createdAt = createdAt;
  }
}
