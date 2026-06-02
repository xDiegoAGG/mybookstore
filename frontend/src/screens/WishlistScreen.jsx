import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Image,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaTrash, FaArrowLeft } from "react-icons/fa";
import { api } from "../lib/api";
import { AuthContext } from "../context/AuthContext.jsx";

const WishlistScreen = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    load();
  }, [isAuthenticated]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/wishlist");
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      console.error("Wishlist load error:", err);
      setError("No se pudo cargar tu wishlist.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookId) => {
    try {
      await api.delete(`/api/wishlist/${encodeURIComponent(bookId)}`);
      setItems((prev) => prev.filter((it) => it.bookId !== bookId));
    } catch (err) {
      console.error("Wishlist delete error:", err);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Link to="/" className="btn btn-light mb-4 d-inline-flex align-items-center gap-2">
        <FaArrowLeft /> Volver al catálogo
      </Link>

      <h2 className="fw-bold mb-4 d-flex align-items-center gap-2">
        <FaHeart className="text-danger" /> Mi lista de deseos
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {items.length === 0 ? (
        <Alert variant="light" className="border">
          Aún no tienes libros en tu lista de deseos. Explora el{" "}
          <Link to="/">catálogo</Link> y agrega tus favoritos.
        </Alert>
      ) : (
        <Row className="g-4">
          {items.map((it) => (
            <Col key={it.id} sm={6} md={4} lg={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                {it.image && (
                  <Link to={`/book/${it.bookId}`}>
                    <Image src={it.image} alt={it.name} fluid />
                  </Link>
                )}
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fs-6">
                    <Link to={`/book/${it.bookId}`} className="text-decoration-none">
                      {it.name || it.bookId}
                    </Link>
                  </Card.Title>
                  {it.price && (
                    <p className="text-primary fw-bold mb-2">{it.price}</p>
                  )}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="mt-auto d-flex align-items-center justify-content-center gap-2"
                    onClick={() => handleRemove(it.bookId)}
                  >
                    <FaTrash /> Quitar
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default WishlistScreen;
