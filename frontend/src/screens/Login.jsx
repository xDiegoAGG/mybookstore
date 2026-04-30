import { useContext, useState } from "react";
import {
  Button,
  Form,
  Card,
  Container,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext.jsx";

const Login = () => {
  const { login, register } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;
    const name = e.target.name?.value;

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center py-5"
      style={{ minHeight: "70vh" }}
    >
      <Card className="shadow-sm rounded-4 border-0" style={{ width: "26rem" }}>
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <FaBookOpen size={36} className="text-primary mb-2" />
            <h3 className="mb-1">
              {mode === "login" ? "Bienvenido" : "Crea tu cuenta"}
            </h3>
            <p className="text-muted small mb-0">
              {mode === "login"
                ? "Ingresa para continuar"
                : "Únete y empieza a comprar libros"}
            </p>
          </div>

          <Form onSubmit={handleSubmit}>
            {mode === "register" && (
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaUser />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Tu nombre"
                    required
                  />
                </InputGroup>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaEnvelope />
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="tucorreo@ejemplo.com"
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaLock />
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="••••••"
                  required
                  minLength={6}
                />
              </InputGroup>
            </Form.Group>

            {error && (
              <Alert variant="danger" className="py-2 small">
                {error}
              </Alert>
            )}

            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-2"
              disabled={loading}
            >
              {loading
                ? "Procesando…"
                : mode === "login"
                ? "Ingresar"
                : "Crear cuenta"}
            </Button>

            <Button
              variant="link"
              className="w-100 mt-2 text-decoration-none"
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login"
                ? "¿No tienes cuenta? Regístrate"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
