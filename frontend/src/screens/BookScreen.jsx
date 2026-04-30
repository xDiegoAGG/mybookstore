import React, { useState, useEffect, useContext } from "react";
import {
  Row,
  Col,
  Image,
  Card,
  Button,
  Form,
  Badge,
  Container,
  Spinner,
  Alert,
  ListGroup,
} from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaShoppingCart, FaStar, FaRegStar } from "react-icons/fa";
import { api } from "../lib/api";
import { AuthContext } from "../context/AuthContext.jsx";
import { CartContext } from "../context/CartContext.jsx";

const Stars = ({ value = 0, onChange, size = 18 }) => {
  const interactive = typeof onChange === "function";
  return (
    <span className="d-inline-flex gap-1 align-items-center">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const Icon = filled ? FaStar : FaRegStar;
        return (
          <Icon
            key={n}
            size={size}
            className={filled ? "text-warning" : "text-muted"}
            style={{ cursor: interactive ? "pointer" : "default" }}
            onClick={interactive ? () => onChange(n) : undefined}
          />
        );
      })}
    </span>
  );
};

const ReviewsSection = ({ bookId }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/reviews/book/${bookId}`);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [bookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      await api.post(`/api/reviews/book/${bookId}`, { rating, comment });
      setComment("");
      setRating(5);
      setFeedback({ type: "success", message: "¡Gracias por tu reseña!" });
      await load();
    } catch (err) {
      setFeedback({
        type: "danger",
        message: err.response?.data?.message || "No se pudo guardar la reseña",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((a, r) => a + Number(r.rating || 0), 0) / reviews.length;

  return (
    <Card className="border-0 shadow-sm rounded-4 mt-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Reseñas</h4>
          {reviews.length > 0 && (
            <span className="text-muted small">
              <Stars value={Math.round(avg)} size={14} /> {avg.toFixed(1)} (
              {reviews.length})
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-muted">Aún no hay reseñas. ¡Sé el primero!</p>
        ) : (
          <ListGroup variant="flush" className="mb-3">
            {reviews.map((r) => (
              <ListGroup.Item key={r.id} className="px-0">
                <div className="d-flex justify-content-between">
                  <strong>{r.authorName || "Anónimo"}</strong>
                  <Stars value={r.rating} size={14} />
                </div>
                {r.comment && <p className="mb-1 mt-1">{r.comment}</p>}
                {r.createdAt && (
                  <small className="text-muted">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </small>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        <hr />
        <h6 className="mb-3">Deja tu reseña</h6>
        {!isAuthenticated ? (
          <Alert variant="light" className="border">
            <Link to="/login">Inicia sesión</Link> para dejar una reseña.
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="mb-1">Calificación</Form.Label>
              <div>
                <Stars value={rating} onChange={setRating} size={24} />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="mb-1">Comentario</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué te pareció el libro?"
              />
            </Form.Group>
            {feedback.message && (
              <Alert variant={feedback.type} className="py-2">
                {feedback.message}
              </Alert>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Enviando…" : "Publicar reseña"}
            </Button>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

const BookScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { addItem } = useContext(CartContext);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/books/${id}`);
        setBook(data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el libro.");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleAdd = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setAdding(true);
    setAddedMsg("");
    try {
      await addItem(book.id, qty);
      setAddedMsg("Añadido al carrito");
    } catch (err) {
      setAddedMsg(err.response?.data?.message || "No se pudo añadir");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error || !book) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || "Libro no encontrado"}</Alert>
        <Link to="/" className="btn btn-light">
          <FaArrowLeft /> Volver al catálogo
        </Link>
      </Container>
    );
  }

  const inStock = Number(book.countInStock) > 0;
  const stockOptions = Array.from(
    { length: Math.min(Number(book.countInStock || 0), 10) },
    (_, i) => i + 1
  );

  return (
    <Container className="py-4">
      <Link to="/" className="btn btn-light mb-4 d-inline-flex align-items-center gap-2">
        <FaArrowLeft /> Volver al catálogo
      </Link>

      <Row className="g-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Image src={book.image} alt={book.name} fluid />
          </Card>
        </Col>

        <Col md={5}>
          <h2 className="fw-bold mb-2">{book.name}</h2>
          <p className="text-muted mb-3">por {book.author}</p>
          <p className="lead">{book.description}</p>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Precio</span>
                <strong className="text-primary fs-5">{book.price}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Estado</span>
                {inStock ? (
                  <Badge bg="success-subtle" text="success" pill>
                    {book.countInStock} disp.
                  </Badge>
                ) : (
                  <Badge bg="danger-subtle" text="danger" pill>
                    Agotado
                  </Badge>
                )}
              </div>

              {inStock && (
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Cantidad</Form.Label>
                  <Form.Select
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  >
                    {stockOptions.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              <Button
                onClick={handleAdd}
                disabled={!inStock || adding}
                className="w-100 d-flex justify-content-center align-items-center gap-2"
              >
                <FaShoppingCart />
                {adding ? "Añadiendo…" : "Añadir al carrito"}
              </Button>

              {addedMsg && (
                <p className="text-center small mt-2 mb-0 text-success">
                  {addedMsg}
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ReviewsSection bookId={book.id} />
    </Container>
  );
};

export default BookScreen;
