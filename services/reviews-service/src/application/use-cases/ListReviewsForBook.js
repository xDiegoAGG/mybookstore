export class ListReviewsForBook {
  constructor({ reviewRepository, usersService }) {
    this.repo = reviewRepository;
    this.users = usersService;
  }

  async execute(bookId) {
    const reviews = await this.repo.findByBookId(bookId);
    const enriched = await Promise.all(
      reviews.map(async (r) => {
        if (r.authorName) return r;
        try {
          const user = await this.users.getUser(r.userId);
          return { ...r, authorName: user?.name || user?.email || r.userId };
        } catch (_err) {
          return { ...r, authorName: r.userId };
        }
      })
    );
    return enriched;
  }
}
