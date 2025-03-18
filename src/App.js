import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrderDetails from "./pages/OrderDetails";
function Layout() {
  const location = useLocation();
  const hideHeaderFooter = ["/login", "/register"].includes(location.pathname);

  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  return (
    <div className='App'>
      {!hideHeaderFooter && <Header cartItems={cartItems} />}
      <main className='main-content'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route
            path='/cart'
            element={<Cart cartItems={cartItems} setCartItems={setCartItems} />}
          />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/orderDetails' element={<OrderDetails />} />
          <Route
            path='/products'
            element={
              <Products addToCart={addToCart} key={window.location.pathname} />
            }
          />
          <Route
            path='/products/:categoryId'
            element={
              <Products addToCart={addToCart} key={window.location.pathname} />
            }
          />
          <Route
            path='/products/:categoryId/:productId'
            element={
              <Products addToCart={addToCart} key={window.location.pathname} />
            }
          />
        </Routes>
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
