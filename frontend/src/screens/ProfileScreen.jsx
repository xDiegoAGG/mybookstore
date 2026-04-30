import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext.jsx";
import { api } from "../lib/api";

const ProfileScreen = () => {
  const { user, refreshProfile } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/users/me");
        setProfile(data);
        setName(data.name || "");
        setAddress(data.address || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <h3 className="mb-3">Inicia sesión para ver tu perfil</h3>
        <Link to="/login" className="btn btn-primary">
          Iniciar sesión
        </Link>
      </Container>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: "", message: "" });
    try {
      const { data } = await api.put("/api/users/me", { name, address });
      setProfile(data);
      await refreshProfile();
      setFeedback({ type: "success", message: "Perfil actualizado" });
    } catch (err) {
      setFeedback({
        type: "danger",
        message: err.response?.data?.message || "Error al guardar",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-4">Mi perfil</h2>
      <Row className="g-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 text-center">
            <Card.Body className="py-4">
              <FaUserCircle size={72} className="text-primary mb-3" />
              <h5 className="mb-1">{profile?.name || "Sin nombre"}</h5>
              <p className="text-muted small mb-0">
                {profile?.email || user.email}
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <h5 className="mb-3">Datos personales</h5>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (
                <Form onSubmit={handleSave}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre completo"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Calle, ciudad, país"
                    />
                  </Form.Group>

                  {feedback.message && (
                    <Alert variant={feedback.type} className="py-2">
                      {feedback.message}
                    </Alert>
                  )}

                  <Button type="submit" disabled={saving}>
                    {saving ? "Guardando…" : "Guardar cambios"}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileScreen;
