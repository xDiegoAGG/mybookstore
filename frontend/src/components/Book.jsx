import React from "react";
import { Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const Book = ({ book }) => {
  const inStock = Number(book.countInStock) > 0;
  return (
    <Card className="book-card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
      <Link
        to={`/book/${book.id}`}
        className="d-block position-relative book-card__image-wrapper"
      >
        <Card.Img
          src={book.image || "/placeholder.png"}
          alt={book.name}
          className="book-card__image"
        />
        {!inStock && (
          <Badge
            bg="secondary"
            className="position-absolute top-0 end-0 m-2 px-3 py-2 rounded-pill"
          >
            Agotado
          </Badge>
        )}
      </Link>

      <Card.Body className="d-flex flex-column">
        <Link
          to={`/book/${book.id}`}
          className="text-decoration-none text-dark"
        >
          <Card.Title as="h6" className="fw-semibold mb-1 book-card__title">
            {book.name}
          </Card.Title>
        </Link>
        <Card.Subtitle className="text-muted small mb-3">
          {book.author}
        </Card.Subtitle>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="fw-bold text-primary">{book.price}</span>
          {inStock ? (
            <Badge bg="success-subtle" text="success" pill>
              Disponible
            </Badge>
          ) : (
            <Badge bg="danger-subtle" text="danger" pill>
              Sin stock
            </Badge>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default Book;
