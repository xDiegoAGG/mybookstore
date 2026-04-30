export class OrderRepository {
  async create(_order) {
    throw new Error("OrderRepository.create not implemented");
  }

  async findByUserId(_userId) {
    throw new Error("OrderRepository.findByUserId not implemented");
  }
}
