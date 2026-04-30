import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeScreen from "./screens/HomeScreen";
import BookScreen from "./screens/BookScreen";
import AboutScreen from "./screens/AboutScreen";
import LoginScreen from "./screens/Login";
import ProfileScreen from "./screens/ProfileScreen";
import CartScreen from "./screens/CartScreen";
import OrdersScreen from "./screens/OrdersScreen";

const App = () => {
  return (
    <Router>
      <div className="app-shell">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/book/:id" element={<BookScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/orders" element={<OrdersScreen />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
