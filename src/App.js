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
import Favorites from "./pages/Favorites";

function Layout() {
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const hideHeaderFooter = ["/login", "/register"].includes(location.pathname);

  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const storedFavorites =
      JSON.parse(localStorage.getItem(`favorite_items_${userId}`)) || [];
    setCartItems(storedCart);
    setFavorites(storedFavorites);
  }, [userId]);

  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem(
        `favorite_items_${userId}`,
        JSON.stringify(favorites)
      );
    }
  }, [favorites, userId]);

  // Toggle favorite function
  const toggleFavorite = (product) => {
    setFavorites((prevFavorites) => {
      const isFavorite = prevFavorites.some((item) => item.id === product.id);

      if (isFavorite) {
        // Remove from favorites
        return prevFavorites.filter((item) => item.id !== product.id);
      } else {
        // Add to favorites
        return [...prevFavorites, product];
      }
    });
  };

  const deleteItemFromFavorites = (itemId) => {
    setFavorites((prev) => prev.filter((item) => item.id !== itemId));
  };

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
      {!hideHeaderFooter && (
        <Header favorites={favorites} cartItems={cartItems} />
      )}
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
            path='/favorites'
            element={
              <Favorites
                favorites={favorites}
                deleteItemFromFavorites={deleteItemFromFavorites}
              />
            }
          />
          <Route
            path='/products'
            element={
              <Products
                toggleFavorite={toggleFavorite}
                favorites={favorites}
                addToCart={addToCart}
                key={window.location.pathname}
              />
            }
          />
          <Route
            path='/products/:categoryId'
            element={
              <Products
                toggleFavorite={toggleFavorite}
                favorites={favorites}
                addToCart={addToCart}
                key={window.location.pathname}
              />
            }
          />
          <Route
            path='/products/:categoryId/:productId'
            element={
              <Products
                toggleFavorite={toggleFavorite}
                favorites={favorites}
                addToCart={addToCart}
                key={window.location.pathname}
              />
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
