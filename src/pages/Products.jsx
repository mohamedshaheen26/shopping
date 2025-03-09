import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";

import Alert from "../components/Alert";
import Loading from "../components/Loading";
import SimilarProducts from "../components/SimilarProducts";

const API_BASE_URL = "https://nshopping.runasp.net/api";
const userId = localStorage.getItem("userId");

const Shop = ({ addToCart }) => {
  const { categoryId, productId } = useParams(); // ✅ Get categoryId and productId from URL
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [singleProduct, setSingleProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const location = useLocation();

  const [categoryName, setCategoryName] = useState("");
  const [productName, setProductName] = useState("");

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(""), 3000);
  };

  useEffect(() => {
    if (productId) {
      fetchSingleProduct();
    } else {
      fetchProducts();
    }
  }, [categoryId, productId, location.pathname]);

  useEffect(() => {
    filterProducts();
  }, [categoryId, searchTerm, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Product`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      showAlert("Failed to load products.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Product/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch product details");
      const data = await response.json();
      setSingleProduct(data);
      setProductName(data.name || ""); // Set Product Name

      // Fetch category name
      if (data.categoryId) {
        const categoryResponse = await fetch(
          `${API_BASE_URL}/Category/GetById/${data.categoryId}`
        );
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          setCategoryName(categoryData.name || ""); // Set Category Name
        }
      }
    } catch (error) {
      showAlert("Failed to load product details.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let updatedProducts = [...products];

    if (categoryId) {
      updatedProducts = updatedProducts.filter(
        (product) => product.categoryId === Number(categoryId)
      );
    }

    if (searchTerm) {
      updatedProducts = updatedProducts.filter((product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(updatedProducts);
  };

  const handleAddToCart = async (product) => {
    addToCart(product);

    if (!userId) {
      showAlert("Please login to add items to the cart.", "danger");
      return;
    }

    try {
      let cartId = null;

      // Step 1: Get the user's cart
      const cartResponse = await fetch(
        `https://nshopping.runasp.net/api/Cart/GetByUser/${userId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        cartId = cartData?.id || null;
        console.log("Existing cart:", cartId);
      }

      // Step 2: If no cart exists, create a new one with delivery
      if (!cartId) {
        const createCartResponse = await fetch(
          `https://nshopping.runasp.net/api/Cart/Create/${userId}?delivery=1`,
          { method: "POST", headers: { "Content-Type": "application/json" } }
        );

        const newCart = await createCartResponse.json();
        if (!createCartResponse.ok) throw new Error("Failed to create cart");
        cartId = newCart.id;
        console.log("New cart created:", cartId);
      }

      // Step 3: Add item to cart
      const addItemResponse = await fetch(
        `https://nshopping.runasp.net/api/Cart/AddItem/${cartId}?delivery=1`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
          }),
        }
      );

      const addItemData = await addItemResponse.json();
      console.log("Add item response:", addItemData);

      if (!addItemResponse.ok) throw new Error("Failed to add item to cart");

      showAlert("Item added to cart!", "success");
    } catch (error) {
      console.error("Error adding item to cart:", error);
      showAlert("Failed to add item. Please try again.", "danger");
    }
  };

  return (
    <section className='shop'>
      <div className='container'>
        {alertMessage && <Alert message={alertMessage} type={alertType} />}

        {/* Search Box */}
        <div className='row mb-2 justify-content-center'>
          <div className='col-md-6 mb-2'>
            <div className='form-group has-search'>
              <span className='fa fa-search form-control-search'></span>
              <input
                type='text'
                className='form-control search'
                placeholder='Search'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav aria-label='breadcrumb'>
          <ol className='breadcrumb'>
            {/* Home Link */}
            <li className='breadcrumb-item'>
              <Link to='/'>Home</Link>
            </li>

            {/* "All Products" Clickable only if not already on /products */}
            <li className='breadcrumb-item'>
              {categoryId || productId ? (
                <Link to='/products'>All Products</Link>
              ) : (
                "All Products"
              )}
            </li>

            {/* Category - Clickable only if on a single product page */}
            {categoryId && (
              <li
                className={`breadcrumb-item ${productId ? "" : "active"}`}
                aria-current={!productId ? "page" : undefined}
              >
                {productId ? (
                  <Link to={`/products/${categoryId}`}>{categoryName}</Link>
                ) : (
                  categoryName
                )}
              </li>
            )}

            {/* Product Name - Always last and not clickable */}
            {productId && (
              <li className='breadcrumb-item active' aria-current='page'>
                {productName}
              </li>
            )}
          </ol>
        </nav>

        {/* Loading Indicator */}
        {loading ? (
          <Loading />
        ) : singleProduct ? (
          // Single Product View

          <div className='row' id='productDetailsContainer'>
            <div className='col-md-8'>
              <h2>{singleProduct.name}</h2>
              <p>{singleProduct.description}</p>
              <p>Price: {singleProduct.price}EGP</p>
              <div className='text-warning mb-3'>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
                <i className='fas fa-star'></i>
                <i className='far fa-star'></i>
              </div>
              <button
                className={`add-cart border-0 ${
                  singleProduct.stock > 0 ? "" : "disabled"
                }`}
                onClick={() => addToCart(singleProduct)}
                disabled={singleProduct.stock === 0}
              >
                Add to Cart <i className='fas fa-shopping-cart'></i>
              </button>
            </div>
            <div className='col-md-4'>
              <img
                src={singleProduct.imageUrl}
                alt={singleProduct.name}
                className='img-fluid'
              />
            </div>
            <SimilarProducts userId={userId} selectedProductId={productId} />
          </div>
        ) : (
          // Product List View
          <div className='items'>
            <div className='row'>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div key={product.id} className='col-sm-6 col-md-4 mb-4'>
                    <div className='card product-box h-100'>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className='product-img'
                      />
                      <div className='card-body d-flex flex-column justify-content-between p-4'>
                        <div className='d-flex justify-content-between gap-3'>
                          <h5 className='card-title mb-0'>{product.name}</h5>
                          <span className='product-price'>
                            {product.price}EGP
                          </span>
                        </div>
                        <div className='text-warning mb-3'>
                          <i className='fas fa-star'></i>
                          <i className='fas fa-star'></i>
                          <i className='fas fa-star'></i>
                          <i className='fas fa-star'></i>
                          <i className='far fa-star'></i>
                          <span className='text-muted'>
                            {product.stock > 0 ? "Available" : "Unavailable"}
                          </span>
                        </div>
                        <div className='d-flex justify-content-evenly'>
                          <button
                            className={`add-cart border-0 ${
                              product.stock > 0 ? "" : "disabled"
                            }`}
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                          >
                            Add to Cart <i className='fas fa-shopping-cart'></i>
                          </button>
                          <Link
                            to={`/products/${product.categoryId}/${product.id}`}
                            className='view-product'
                          >
                            View Details{" "}
                            <i className='fas fa-chevron-right text-white'></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className='col-12 text-center'>
                  <p>No products found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Shop;
