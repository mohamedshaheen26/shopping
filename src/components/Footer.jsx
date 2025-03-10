import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className='text-white'>
      <div className='container'>
        <div className='row'>
          <div className='col-md-4 mb-3'>
            <a href='#' className='logo text-white'>
              Vé.a
            </a>
            <ul className='d-block'>
              Why Choose Us?
              <li>✔️ Stylish designs & premium quality</li>
              <li>✔️ Exclusive deals & discounts all year round</li>
              <li>✔️ Fast shipping & excellent customer support</li>
            </ul>
          </div>
          <div className='col-md-2 mb-3'>
            <h4>About Us</h4>
            <ul>
              <li className='mb-2'>
                <Link className='text-white' to='/'>
                  Home
                </Link>
              </li>
              <li className='mb-2'>
                <Link className='text-white' to='products'>
                  Find a Product
                </Link>
              </li>
              <li className='mb-2'>
                <Link className='text-white' href='#'>
                  About Us
                </Link>
              </li>
              <li className='mb-2'>
                <Link className='text-white' href='#'>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div className='col-md-3 mb-3'>
            <h4>Contact Us</h4>
            <ul>
              <li className='mb-2'>
                <i className='fas fa-phone me-2'></i>
                +20191342347
              </li>
              <li className='mb-2'>
                <i className='fas fa-map-marker-alt me-2'></i>
                123 Main Street, Anytown, USA
              </li>
              <li className='mb-2'>
                <i className='fas fa-envelope me-2'></i>
                example@example.com
              </li>
            </ul>
          </div>
          <div className='col-md-3 mb-3'>
            <h4>Request a more details</h4>
            <input
              type='email'
              placeholder='Email...'
              className='form-control'
            />
            <ul className='social-icons mt-3 d-flex justify-content-between'>
              <li className='social-links'>
                <a
                  href='https://www.facebook.com/share/19QfGkoNqr/'
                  target='_blank'
                >
                  <i className='fab fa-facebook'></i>
                </a>
              </li>
              <li className='social-links'>
                <a
                  href='https://www.instagram.com/vea2_0?igsh=bXl3djg2a2sxMTIw'
                  target='_blank'
                >
                  <i className='fab fa-instagram'></i>
                </a>
              </li>
              <li className='social-links'>
                <a
                  href='https://www.tiktok.com/@vea2_0?_t=ZS-8u4nuQNjGAJ&_r=1'
                  target='_blank'
                >
                  <i className='fab fa-tiktok'></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
