import React, { useContext, useEffect, useState } from "react";
import { Container, Card, Row, Col, ListGroup, Form, Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext.jsx";
import { api } from "../lib/api";

const ProfileScreen = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const { data } = await api.get("/api/users/me");
        setProfile(data);
        setName(data.name || "");
        setAddress(data.address || "");
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const { data } = await api.put("/api/users/me", { name, address });
      setProfile(data);
      setMessage("Perfil actualizado");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <h3>No estás autenticado</h3>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Mi Perfil</h2>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow rounded-4 p-4">
            <ListGroup variant="flush" className="mb-3">
              <ListGroup.Item>
                <strong>Email:</strong> {profile?.email || user.email}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>UserId:</strong> {user.userId}
              </ListGroup.Item>
            </ListGroup>

            <Form onSubmit={handleSave}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Form.Group>

              {message && <p>{message}</p>}

              <Button type="submit" disabled={saving} className="rounded-pill">
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileScreen;
