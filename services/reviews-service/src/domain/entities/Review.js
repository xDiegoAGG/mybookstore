export class Review {
  constructor({ id, bookId, userId, rating, comment, createdAt, authorName }) {
    this.id = id;
    this.bookId = bookId;
    this.userId = userId;
    this.rating = rating;
    this.comment = comment;
    this.createdAt = createdAt;
    this.authorName = authorName;
  }
}
