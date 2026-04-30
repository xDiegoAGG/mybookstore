import React from "react";
import { Container } from "react-bootstrap";
import { FaBookOpen } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="site-footer mt-auto">
      <Container className="py-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-2 text-muted small">
          <FaBookOpen /> MyBookStore
        </div>
        <small className="text-muted">
          © {new Date().getFullYear()} MyBookStore. Diego Andres Gonzalez Graciano.
        </small>
      </Container>
    </footer>
  );
};

export default Footer;
