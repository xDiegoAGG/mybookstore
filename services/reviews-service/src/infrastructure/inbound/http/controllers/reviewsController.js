export const makeReviewsController = ({ listReviewsForBook, addReview }) => ({
  list: async (req, res, next) => {
    try {
      const reviews = await listReviewsForBook.execute(req.params.bookId);
      res.json(reviews);
    } catch (err) {
      next(err);
    }
  },

  add: async (req, res, next) => {
    try {
      const { rating, comment } = req.body || {};
      const review = await addReview.execute({
        bookId: req.params.bookId,
        userId: req.user.userId,
        rating,
        comment,
      });
      res.status(201).json(review);
    } catch (err) {
      next(err);
    }
  },
});
