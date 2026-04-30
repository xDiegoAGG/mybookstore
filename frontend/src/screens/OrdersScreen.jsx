import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Card,
  Spinner,
  Alert,
  Badge,
  Accordion,
  Table,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaBoxOpen } from "react-icons/fa";
import { api } from "../lib/api";
import { AuthContext } from "../context/AuthContext.jsx";

const OrdersScreen = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/orders/");
        const list = Array.isArray(data) ? data : [];
        list.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setOrders(list);
        setError("");
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los pedidos.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Container className="py-5 text-center">
        <h3 className="mb-3">Inicia sesión para ver tus pedidos</h3>
        <Link to="/login" className="btn btn-primary">
          Iniciar sesión
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">Mis pedidos</h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : orders.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 text-center py-5">
          <Card.Body>
            <FaBoxOpen size={48} className="text-muted mb-3" />
            <h5>Aún no tienes pedidos</h5>
            <p className="text-muted">
              Cuando confirmes una compra aparecerá aquí.
            </p>
            <Link to="/" className="btn btn-primary">
              Ver catálogo
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Accordion defaultActiveKey="0">
          {orders.map((order, idx) => (
            <Accordion.Item eventKey={String(idx)} key={order.id}>
              <Accordion.Header>
                <div className="d-flex flex-grow-1 justify-content-between align-items-center pe-3">
                  <div>
                    <strong>#{order.id?.slice(0, 8)}</strong>
                    <span className="text-muted ms-2 small">
                      {order.createdAt &&
                        new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <Badge bg="primary-subtle" text="primary" pill>
                    ${Number(order.total || 0).toFixed(2)}
                  </Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body className="p-0">
                <Table responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Libro</th>
                      <th className="text-center">Cant.</th>
                      <th className="text-end">Precio</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items || []).map((item) => (
                      <tr key={item.bookId}>
                        <td>{item.name}</td>
                        <td className="text-center">{item.qty}</td>
                        <td className="text-end">
                          ${Number(item.unitPrice || 0).toFixed(2)}
                        </td>
                        <td className="text-end">
                          ${Number(item.subtotal || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Container>
  );
};

export default OrdersScreen;
