import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaBookOpen, FaShoppingCart, FaStar, FaLock } from "react-icons/fa";

const features = [
  {
    icon: FaBookOpen,
    title: "Catálogo curado",
    text: "Una selección variada de novelas, clásicos y nuevos lanzamientos.",
  },
  {
    icon: FaShoppingCart,
    title: "Compra rápida",
    text: "Añade libros al carrito y completa tu pedido en pocos pasos.",
  },
  {
    icon: FaStar,
    title: "Reseñas reales",
    text: "Lee opiniones de otros lectores y comparte la tuya.",
  },
  {
    icon: FaLock,
    title: "Cuenta segura",
    text: "Tu perfil y tus pedidos están protegidos con autenticación.",
  },
];

const AboutScreen = () => {
  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold mb-3">Acerca de MyBookStore</h1>
        <p className="lead text-muted col-lg-8 mx-auto">
          MyBookStore es una librería en línea construida sobre una arquitectura
          de microservicios. Aquí puedes explorar el catálogo, gestionar tu
          carrito, dejar reseñas y mantener un historial de tus pedidos.
        </p>
      </div>

      <Row className="g-4">
        {features.map(({ icon: Icon, title, text }) => (
          <Col md={6} lg={3} key={title}>
            <Card className="border-0 shadow-sm rounded-4 h-100 text-center">
              <Card.Body className="py-4">
                <Icon size={36} className="text-primary mb-3" />
                <h5 className="mb-2">{title}</h5>
                <p className="text-muted small mb-0">{text}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AboutScreen;
