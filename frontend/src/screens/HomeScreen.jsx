import React, { useState, useEffect } from "react";
import { Col, Row, Container, Spinner, Alert, Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import Book from "../components/Book";
import HomeCarousel from "../components/Carousel";
import { api } from "../lib/api";

const HomeScreen = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/books/");
        setBooks(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        console.error("Error loading books:", err);
        setError("No pudimos cargar el catálogo. Intenta de nuevo en unos segundos.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);



  useEffect(() => {
    const q = query.trim();
    if (!q) return;

    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/api/search?q=${encodeURIComponent(q)}`);
        setBooks(Array.isArray(data?.items) ? data.items : []);
        setError("");
      } catch (err) {
        console.error("Lambda search error:", err);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = books;

  return (
    <>
      <HomeCarousel />

      <Container className="my-5">
        <Row className="align-items-center mb-4 g-3">
          <Col md>
            <h2 className="mb-1 fw-bold">Catálogo</h2>
            <p className="text-muted mb-0">
              {filtered.length} {filtered.length === 1 ? "libro" : "libros"}
              {searching && <span className="ms-2">(buscando…)</span>}
            </p>
          </Col>
          <Col md="auto">
            <InputGroup className="search-input">
              <InputGroup.Text className="bg-white border-end-0">
                <FaSearch className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Buscar por título o autor"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
            <p className="text-muted mt-3 mb-0">Cargando catálogo…</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : filtered.length === 0 ? (
          <Alert variant="light" className="text-center border">
            No encontramos libros que coincidan con tu búsqueda.
          </Alert>
        ) : (
          <Row className="g-4">
            {filtered.map((book) => (
              <Col key={book.id} sm={6} md={4} lg={3}>
                <Book book={book} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default HomeScreen;
