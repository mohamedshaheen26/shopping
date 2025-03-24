import { React, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "../components/Slider";
import Loading from "../components/Loading";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { API_BASE_URL } from "../config";

const allCollection = [
  "/assets/collection-1.jpg",
  "/assets/collection-2.jpg",
  "/assets/collection-3.jpg",
  "/assets/collection-4.jpg",
  "/assets/collection-5.jpg",
  "/assets/collection-6.jpg",
  "/assets/collection-7.jpg",
  "/assets/collection-8.jpg",
  "/assets/collection-9.jpg",
  "/assets/collection-10.jpg",
  "/assets/collection-11.jpg",
  "/assets/collection-12.jpg",
];

const trending = [
  "/assets/trending-1.jpg",
  "/assets/trending-2.jpg",
  "/assets/trending-3.jpg",
  "/assets/trending-4.jpg",
  "/assets/trending-5.jpg",
  "/assets/trending-6.jpg",
  "/assets/trending-7.jpg",
  "/assets/trending-8.jpg",
  "/assets/trending-9.jpg",
  "/assets/trending-10.jpg",
  "/assets/trending-11.jpg",
  "/assets/trending-12.jpg",
];

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userName = localStorage.getItem("userName");

    if (userName) {
      toast.success(`👋 Welcome Back, ${userName}!`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        closeButton: false,
        style: { width: "350px" },
      });
      // Remove AFTER the toast is displayed (5 seconds later)
      setTimeout(() => {
        localStorage.removeItem("userName");
      }, 5000);
    }
  }, []);

  // Fetch categories & products
  useEffect(() => {
    const fetchCategoriesWithRandomImages = async () => {
      try {
        setLoading(true);

        const categoryResponse = await fetch(
          `${API_BASE_URL}/Category/AllCategories`
        );
        if (!categoryResponse.ok) throw new Error("Failed to fetch categories");

        const categoriesData = await categoryResponse.json();

        const productsResponse = await fetch(`${API_BASE_URL}/Product`);
        if (!productsResponse.ok) throw new Error("Failed to fetch products");

        const productsData = await productsResponse.json();

        setCategories(categoriesData);
        setProducts(productsData);
      } catch (error) {
        toast.error(`Failed to load categories`, {
          position: "top-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          closeButton: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesWithRandomImages();
  }, []);

  return (
    <>
      <section className='hero-section mb-3 mb-lg-5'>
        <ToastContainer style={{ zIndex: 99999999 }} />
        <div className='hero-content'>
          <h1 className='hero-headline'>New Season, New Style!</h1>
          <Link to='/products' className='hero-button'>
            Shop Now
          </Link>
        </div>
      </section>

      <section className='categories-section mb-3 mb-lg-5'>
        <h1 className='section-title mb-4'>Categories</h1>
        {loading ? (
          <Loading />
        ) : categories.length === 0 ? (
          <p>No categories available</p>
        ) : (
          <ul className='products'>
            {categories.map((category) => {
              // Filter products for this category
              const categoryProducts = products.filter(
                (product) => product.categoryId === category.id
              );

              // Pick a random product image (fallback if no products)
              const imageUrl =
                categoryProducts.length > 0
                  ? categoryProducts[0].imageUrl // Use product's image if available
                  : "../assets/No_Image_Available.jpg"; // Fallback image

              return (
                <li key={category.id} className='text-center'>
                  <Link to={`/products/${category.id}`} className='category'>
                    <img
                      src={imageUrl}
                      alt={category.name}
                      style={{
                        width: "140px",
                        height: "140px",
                        objectFit: "cover",
                      }}
                      className='category-img rounded-circle'
                    />
                    <p className='mt-2'>{category.name}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section className='collection mb-3 mb-lg-5'>
        <h1 className='section-title mb-4'>All Collections</h1>
        <Slider images={allCollection} itemsPerSlide={3} />
      </section>
      <section className='discount mb-3 mb-lg-5'>
        <div className='container'>
          <img src='../assets/discount.jpg' alt='discount' />
        </div>
      </section>
      <section className='trending mb-3 mb-lg-5'>
        <h1 className='section-title mb-4'>Trending</h1>
        <Slider images={trending} itemsPerSlide={3} />
      </section>
    </>
  );
};

export default Home;
