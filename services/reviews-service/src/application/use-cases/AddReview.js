import { randomUUID } from "crypto";
import { Review } from "../../domain/entities/Review.js";

export class AddReview {
  constructor({ reviewRepository, usersService }) {
    this.repo = reviewRepository;
    this.users = usersService;
  }

  async execute({ bookId, userId, rating, comment }) {
    let authorName = userId;
    try {
      const user = await this.users.getUser(userId);
      authorName = user?.name || user?.email || userId;
    } catch (_err) {
      // user-service unavailable, fall back to userId
    }

    const review = new Review({
      id: randomUUID(),
      bookId,
      userId,
      rating: Number(rating) || 0,
      comment: comment || "",
      createdAt: new Date().toISOString(),
      authorName,
    });

    return this.repo.create(review);
  }
}
