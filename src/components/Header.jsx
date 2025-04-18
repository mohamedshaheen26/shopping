import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ cartItems, favorites, isLoggedIn }) => {
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const [userName, setUserName] = useState("");
  const [profileMenu, setProfileMenu] = useState(false);

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "");
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top whenever location changes
  }, [location.pathname]);

  const removeCredntials = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("cart");
    localStorage.removeItem(`cart_${userId}`);
    localStorage.removeItem("userName");
    localStorage.removeItem("firstLogin");
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
                <li className='user-account position-relative'>
                  <button
                    className='login_icon'
                    title='Profile'
                    onClick={() => setProfileMenu((prev) => !prev)}
                  >
                    <img src='../../assets/profile.png' alt='Profile' />
                  </button>
                  {profileMenu && (
                    <div className='menu'>
                      {isLoggedIn && (
                        <span className='user-name'>
                          <strong>{userName}</strong>
                        </span>
                      )}
                      <ul>
                        {isLoggedIn && (
                          <li className='w-100'>
                            <Link to='/profile'>
                              <i className='fas fa-user'></i>
                              <span>My Profile</span>
                            </Link>
                          </li>
                        )}
                        <li className='w-100 log-out'>
                          <Link
                            to='/login'
                            title={isLoggedIn ? "Logout" : "Login"}
                            onClick={() => {
                              removeCredntials();
                            }}
                          >
                            <i className='fas fa-sign-out-alt'></i>
                            <span>{isLoggedIn ? "Logout" : "Login"}</span>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
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
