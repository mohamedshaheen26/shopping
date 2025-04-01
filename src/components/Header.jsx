import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ cartItems, favorites }) => {
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top whenever location changes
  }, [location.pathname]);

  const removeCredntials = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("cart");
    localStorage.removeItem(`cart_${userId}`);
    window.location.href = "/login";
  };

  return (
    <header>
      <nav className='navbar navbar-expand-lg'>
        <div className='container'>
          <Link className='navbar-brand' to='/'>
            Vé.a
          </Link>
          <button
            className='navbar-toggler'
            type='button'
            data-bs-toggle='collapse'
            data-bs-target='#navbarNavDropdown'
            aria-controls='navbarNavDropdown'
            aria-expanded='false'
            aria-label='Toggle navigation'
          >
            <span className='navbar-toggler-icon'></span>
          </button>
          <div
            className='justify-content-center collapse navbar-collapse'
            id='navbarNavDropdown'
          >
            <ul className='navbar-nav mx-auto'>
              <li className='nav-item'>
                <Link
                  className={`nav-link ${
                    location.pathname === "/" ? "active" : ""
                  }`}
                  to='/'
                >
                  Home
                </Link>
              </li>
              <li className='nav-item'>
                <Link
                  className={`nav-link ${
                    location.pathname.startsWith("/products") ? "active" : ""
                  }`}
                  to='/products'
                >
                  Products
                </Link>
              </li>
              {userId && (
                <li className='nav-item'>
                  <Link
                    className={`nav-link ${
                      location.pathname.startsWith("/orderDetails")
                        ? "active"
                        : ""
                    }`}
                    to='/orderDetails'
                  >
                    Order Details
                  </Link>
                </li>
              )}
            </ul>

            <nav>
              <ul className='nav-icons'>
                <li>
                  <Link className='search_icon' to='products' title='Search'>
                    <img src='../../assets/search_icon.png' alt='Search' />
                  </Link>
                </li>
                <li>
                  <Link className='fav_icon' to='/favorites' title='Favorites'>
                    <img src='../../assets/favorite.png' alt='Favorites' />
                    <span className='fav-count'>{favorites.length}</span>
                  </Link>
                </li>
                <li>
                  <Link className='cart_icon' to='/cart' title='Add to Cart'>
                    <img src='../../assets/cart.png' alt='Cart' />
                    {cartItems.length > 0 ? (
                      <span className='cart-count'>
                        {cartItems.reduce(
                          (total, item) => total + item.quantity,
                          0
                        )}
                      </span>
                    ) : (
                      <span className='cart-count'>0</span>
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    className='login_icon'
                    to='/login'
                    title='Logout'
                    onClick={() => {
                      removeCredntials();
                    }}
                  >
                    <img src='../../assets/profile.png' alt='Profile' />
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
