export class BookNotFoundError extends Error {
  constructor(bookId) {
    super(`Book ${bookId} not found in catalog`);
    this.name = "BookNotFoundError";
  }
}
