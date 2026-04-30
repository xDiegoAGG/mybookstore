import { useContext, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import { useNavigate } from "react-router-dom";
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
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <Card className="p-10 shadow rounded-4" style={{ width: "25rem" }}>
        <Card.Body>
          <h3 className="text-center mb-4">
            {mode === "login" ? "Iniciar Sesión" : "Registrarse"}
          </h3>

          <Form onSubmit={handleSubmit}>
            {mode === "register" && (
              <Form.Group className="mb-3">
                <Form.Label>Nombre:</Form.Label>
                <Form.Control type="text" name="name" placeholder="Tu nombre" required />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Email:</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña:</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="••••••"
                required
              />
            </Form.Group>

            {error && <p className="text-danger">{error}</p>}

            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3 rounded-pill py-10"
              disabled={loading}
            >
              {loading
                ? "Procesando..."
                : mode === "login"
                ? "Ingresar"
                : "Crear cuenta"}
            </Button>

            <Button
              variant="link"
              className="w-100 mt-2"
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login"
                ? "¿No tienes cuenta? Registrarse"
                : "¿Ya tienes cuenta? Iniciar sesión"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
