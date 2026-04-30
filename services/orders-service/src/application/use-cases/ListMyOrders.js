export class ListMyOrders {
  constructor({ orderRepository }) {
    this.repo = orderRepository;
  }

  async execute(userId) {
    return this.repo.findByUserId(userId);
  }
}
