import React, { useContext, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ListGroup,
  Image,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaShoppingBag, FaArrowLeft } from "react-icons/fa";
import { CartContext } from "../context/CartContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { api } from "../lib/api";

const parsePrice = (raw) => {
  const num = Number(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : 0;
};

const CartScreen = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { cart, loading, removeItem, refresh, clearLocal } = useContext(CartContext);
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  if (!isAuthenticated) {
    return (
      <Container className="py-5 text-center">
        <h3 className="mb-3">Inicia sesión para ver tu carrito</h3>
        <Link to="/login" className="btn btn-primary">
          Iniciar sesión
        </Link>
      </Container>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (acc, item) => acc + parsePrice(item.price) * Number(item.qty || 0),
    0
  );

  const handleRemove = async (bookId) => {
    try {
      await removeItem(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    setPlacing(true);
    setFeedback({ type: "", message: "" });
    try {
      const { data } = await api.post("/api/orders/", {});
      clearLocal();
      await refresh();
      setFeedback({
        type: "success",
        message: `Pedido #${data.id?.slice(0, 8)} creado por $${data.total?.toFixed(2)}`,
      });
      setTimeout(() => navigate("/orders"), 1500);
    } catch (err) {
      setFeedback({
        type: "danger",
        message: err.response?.data?.message || "No se pudo crear el pedido",
      });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Container className="py-4">
      <Link to="/" className="btn btn-light mb-3 d-inline-flex align-items-center gap-2">
        <FaArrowLeft /> Seguir comprando
      </Link>

      <h2 className="fw-bold mb-4">Tu carrito</h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : items.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 text-center py-5">
          <Card.Body>
            <FaShoppingBag size={48} className="text-muted mb-3" />
            <h5>Tu carrito está vacío</h5>
            <p className="text-muted">
              Explora el catálogo y agrega tus libros favoritos.
            </p>
            <Link to="/" className="btn btn-primary">
              Ver catálogo
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4">
              <ListGroup variant="flush">
                {items.map((item) => (
                  <ListGroup.Item key={item.bookId} className="p-3">
                    <Row className="align-items-center g-3">
                      <Col xs={3} md={2}>
                        <Image
                          src={`https://picsum.photos/seed/book${item.bookId}/200/280`}
                          alt={item.name}
                          rounded
                          fluid
                        />
                      </Col>
                      <Col xs={9} md>
                        <Link
                          to={`/book/${item.bookId}`}
                          className="text-decoration-none text-dark"
                        >
                          <h6 className="mb-1">{item.name}</h6>
                        </Link>
                        <small className="text-muted">
                          {item.qty} × {item.price}
                        </small>
                      </Col>
                      <Col xs="auto">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemove(item.bookId)}
                          aria-label="Eliminar"
                        >
                          <FaTrash />
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 sticky-lg-top" style={{ top: "1rem" }}>
              <Card.Body>
                <h5 className="mb-3">Resumen</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Productos</span>
                  <span>{items.length}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Subtotal</span>
                  <strong className="fs-5 text-primary">
                    ${subtotal.toFixed(2)}
                  </strong>
                </div>

                {feedback.message && (
                  <Alert variant={feedback.type} className="py-2">
                    {feedback.message}
                  </Alert>
                )}

                <Button
                  className="w-100"
                  onClick={handleCheckout}
                  disabled={placing}
                >
                  {placing ? "Procesando…" : "Confirmar pedido"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CartScreen;
