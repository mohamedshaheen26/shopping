import { React, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Slider from "../components/Slider";
import Loading from "../components/Loading";

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
  const [alertMessage, setAlertMessage] = useState(null);
  const navigate = useNavigate();

  // Fetch categories & products
  useEffect(() => {
    const fetchCategoriesWithRandomImages = async () => {
      try {
        setLoading(true);

        const categoryResponse = await fetch(
          "https://nshopping.runasp.net/api/Category/AllCategories"
        );
        if (!categoryResponse.ok) throw new Error("Failed to fetch categories");

        const categoriesData = await categoryResponse.json();

        const productsResponse = await fetch(
          "https://nshopping.runasp.net/api/Product"
        );
        if (!productsResponse.ok) throw new Error("Failed to fetch products");

        const productsData = await productsResponse.json();

        setCategories(categoriesData);
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching categories or products:", error);
        setAlertMessage("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesWithRandomImages();
  }, []);

  return (
    <>
      <section className='hero-section'>
        <div className='hero-content'>
          <h1 className='hero-headline'>New Season, New Style!</h1>
          <Link to='/products' className='hero-button'>
            Shop Now
          </Link>
        </div>
      </section>

      <section className='products-section'>
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
                  : "https://example.com/images/default-category.jpg"; // Fallback image

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
      <section className='collection'>
        <h1 className='section-title mb-4'>All Collections</h1>
        <Slider images={allCollection} itemsPerSlide={3} />
      </section>
      <section className='discount'>
        <div className='container'>
          <img src='../assets/discount.jpg' alt='discount' />
        </div>
      </section>
      <section className='trending'>
        <h1 className='section-title mb-4'>Trending</h1>
        <Slider images={trending} itemsPerSlide={3} />
      </section>
    </>
  );
};

export default Home;
