import React, { useContext } from "react";
import { Container, Navbar, Nav, NavDropdown, Badge } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { FaShoppingCart, FaBookOpen, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { CartContext } from "../context/CartContext.jsx";

const displayName = (user) => {
  if (!user) return "";
  if (user.name && user.name.trim()) return user.name;
  if (user.email) return user.email.split("@")[0];
  return "Usuario";
};

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { itemCount } = useContext(CartContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header>
      <Navbar
        variant="dark"
        expand="lg"
        collapseOnSelect
        className="shadow-sm site-navbar"
      >
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold">
              <FaBookOpen /> MyBookStore
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <LinkContainer to="/">
                <Nav.Link>Catálogo</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/about">
                <Nav.Link>Acerca de</Nav.Link>
              </LinkContainer>
            </Nav>

            <Nav className="ms-auto align-items-lg-center">
              {user && (
                <LinkContainer to="/cart">
                  <Nav.Link className="d-flex align-items-center gap-1 position-relative">
                    <FaShoppingCart />
                    Carrito
                    {itemCount > 0 && (
                      <Badge
                        bg="warning"
                        text="dark"
                        pill
                        className="ms-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {itemCount}
                      </Badge>
                    )}
                  </Nav.Link>
                </LinkContainer>
              )}

              {!user ? (
                <LinkContainer to="/login">
                  <Nav.Link className="d-flex align-items-center gap-1">
                    <FaUserCircle /> Iniciar sesión
                  </Nav.Link>
                </LinkContainer>
              ) : (
                <NavDropdown
                  title={
                    <span className="d-inline-flex align-items-center gap-2">
                      <FaUserCircle /> {displayName(user)}
                    </span>
                  }
                  id="user-dropdown"
                  align="end"
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Mi perfil</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/orders">
                    <NavDropdown.Item>Mis pedidos</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Cerrar sesión
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
