import { EmptyCartError } from "../../../../domain/errors/EmptyCartError.js";

export const makeOrdersController = ({ createOrder, listMyOrders }) => ({
  create: async (req, res, next) => {
    try {
      const order = await createOrder.execute({
        userId: req.user.userId,
      });
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof EmptyCartError) {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  },

  list: async (req, res, next) => {
    try {
      const orders = await listMyOrders.execute(req.user.userId);
      res.json(orders);
    } catch (err) {
      next(err);
    }
  },
});
