import { BookNotFoundError } from "../../../../domain/errors/BookNotFoundError.js";

export const makeCartController = ({ getCart, addItem, removeItem }) => ({
  get: async (req, res, next) => {
    try {
      const cart = await getCart.execute(req.user.userId);
      res.json(cart);
    } catch (err) {
      next(err);
    }
  },

  add: async (req, res, next) => {
    try {
      const { bookId, qty } = req.body || {};
      if (!bookId) return res.status(400).json({ message: "bookId required" });
      const cart = await addItem.execute({
        userId: req.user.userId,
        bookId,
        qty,
      });
      res.status(201).json(cart);
    } catch (err) {
      if (err instanceof BookNotFoundError) {
        return res.status(404).json({ message: err.message });
      }
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      const cart = await removeItem.execute({
        userId: req.user.userId,
        bookId: req.params.bookId,
      });
      res.json(cart);
    } catch (err) {
      next(err);
    }
  },
});
