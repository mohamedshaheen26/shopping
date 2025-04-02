import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Loading from "../components/Loading";
import SimilarProducts from "../components/SimilarProducts";
import Modal from "../components/Modal";

import { API_BASE_URL } from "../config";

const Shop = ({ addToCart, toggleFavorite, favorites }) => {
  const { categoryId, productId } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [singleProduct, setSingleProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  const [categories, setCategories] = useState([]); // State for categories
  const [categoryName, setCategoryName] = useState("");
  const [productName, setProductName] = useState("");

  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Loader state
  const [selectedCountry, setSelectedCountry] = useState(""); // Track selected country
  const [selectedProduct, setSelectedProduct] = useState(null); // Track selected product

  const [priceRange, setPriceRange] = useState({
    min: 0, // Will be set to actual min price after fetch
    max: 10000, // Will be set to actual max price after fetch
    currentMax: 10000, // Current selected max value
  });
  const [availability, setAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // Track selected category

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (productId) {
      fetchSingleProduct();
    } else {
      fetchProducts();
    }
    fetchCategories(); // Fetch categories when the component mounts
  }, [categoryId, productId, location.pathname]);

  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId); // Automatically select the opened category
    }
  }, [categoryId]);

  useEffect(() => {
    filterProducts();
  }, [
    categoryId,
    searchTerm,
    products,
    priceRange,
    availability,
    sortBy,
    selectedCategory,
  ]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Product`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data || []);
      setFilteredProducts(data || []);

      // Calculate min/max prices
      if (data && data.length > 0) {
        const prices = data.map((product) => product.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        setPriceRange({
          min: minPrice,
          max: maxPrice,
          currentMax: maxPrice, // Initialize to max price
        });
      }

      // If a category is selected, fetch its name
      if (categoryId) {
        const categoryResponse = await fetch(
          `${API_BASE_URL}/Category/GetById/${categoryId}`
        );
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          setCategoryName(categoryData.name || ""); // Set Category Name
        }
      }
    } catch (error) {
      toast.error(`Failed to load products.`, {
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

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Category/AllCategories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      toast.error(`Failed to load categories`, {
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        closeButton: false,
      });
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
      toast.error(`Failed to load product details.`, {
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

  const filterProducts = () => {
    let updatedProducts = [...products];

    // Filter by price range (0 to currentMax)
    updatedProducts = updatedProducts.filter(
      (product) => product.price <= priceRange.currentMax
    );

    if (categoryId) {
      updatedProducts = updatedProducts.filter(
        (product) => product.categoryId === Number(categoryId)
      );
    }

    // Filter by category
    if (selectedCategory) {
      updatedProducts = updatedProducts.filter(
        (product) => product.categoryId === Number(selectedCategory)
      );
    }

    // Filter by search term
    if (searchTerm) {
      updatedProducts = updatedProducts.filter((product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    updatedProducts = updatedProducts.filter(
      (product) =>
        product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Filter by availability
    if (availability === "available") {
      updatedProducts = updatedProducts.filter((product) => product.stock > 0);
    } else if (availability === "unavailable") {
      updatedProducts = updatedProducts.filter(
        (product) => product.stock === 0
      );
    }

    // Sort products
    if (sortBy === "priceLowToHigh") {
      updatedProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHighToLow") {
      updatedProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === "nameAtoZ") {
      updatedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "nameZtoA") {
      updatedProducts.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredProducts(updatedProducts);
  };

  const handleAddToCart = async (product, countryCode) => {
    if (product.stock == 0) {
      toast.warning(`Unavaliable in stock`, {
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        closeButton: false,
      });
      setIsCartModalOpen(false);
      return;
    }

    addToCart(product);
    setIsSaving(true); // Show loading spinner

    try {
      let cartId = null;

      // Step 1: Get the user's cart
      const cartResponse = await fetch(
        `${API_BASE_URL}/Cart/GetByUser/${userId}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        cartId = cartData?.id || null;
      }

      // Step 2: If no cart exists, create a new one with delivery
      if (!cartId) {
        const createCartResponse = await fetch(
          `${API_BASE_URL}/Cart/Create/${userId}?delivery=${countryCode}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );

        const newCart = await createCartResponse.json();
        if (!createCartResponse.ok) throw new Error("Failed to create cart");
        cartId = newCart.id;
      }

      // Step 3: Add item to cart
      const addItemResponse = await fetch(
        `${API_BASE_URL}/Cart/AddItem/${cartId}?delivery=${countryCode}`,
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

      // Decrement stock locally
      const updatedProducts = products.map((p) =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      );

      setProducts(updatedProducts); // Update main products list
      setFilteredProducts(updatedProducts); // Update filtered list

      // If viewing a single product, update its stock too
      if (singleProduct && singleProduct.id === product.id) {
        setSingleProduct({ ...singleProduct, stock: singleProduct.stock - 1 });
      }

      toast.success(`Item added to cart!`, {
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        closeButton: false,
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
    } finally {
      setIsSaving(false); // Hide loading spinner
      setIsCartModalOpen(false); // Close the modal
    }
  };

  const handleConfirmCountry = () => {
    if (selectedProduct && selectedCountry) {
      handleAddToCart(selectedProduct, selectedCountry);
    }
  };

  return (
    <section className='shop'>
      <div className='container'>
        {!singleProduct && (
          <>
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

            {/* Filter Options - Hide if single product is being viewed */}

            <div className='row mb-4'>
              <div className='col-md-3'>
                <label className='form-label' htmlFor='priceRange'>
                  Price
                </label>
                <input
                  type='range'
                  className='form-range styled-range'
                  id='priceRange'
                  min={priceRange.min}
                  max={priceRange.max}
                  value={priceRange.currentMax}
                  onChange={(e) => {
                    setPriceRange({
                      ...priceRange,
                      currentMax: Number(e.target.value),
                    });
                    // Optional: Add debounce here if performance is an issue
                  }}
                  step={1} // Or use appropriate step value
                />
                <div className='d-flex justify-content-between'>
                  <span>${priceRange.min}</span>
                  <span>${priceRange.currentMax}</span>
                </div>
              </div>
              <div className='col-md-3'>
                <label className='form-label' htmlFor='category'>
                  Category
                </label>
                <select
                  className='form-select'
                  id='category'
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={!!categoryId} // Disable if categoryId is present
                >
                  <option value=''>All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='col-md-3'>
                <label className='form-label' htmlFor='availability'>
                  Availability
                </label>
                <select
                  className='form-select'
                  id='availability'
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <option value='all'>All</option>
                  <option value='available'>Available</option>
                  <option value='unavailable'>Unavailable</option>
                </select>
              </div>
              <div className='col-md-3'>
                <label className='form-label' htmlFor='sortBy'>
                  Sort By
                </label>
                <select
                  className='form-select'
                  id='sortBy'
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value=''>Default Sort</option>
                  <option value='priceLowToHigh'>Price: Low to High</option>
                  <option value='priceHighToLow'>Price: High to Low</option>
                  <option value='nameAtoZ'>Name: A to Z</option>
                  <option value='nameZtoA'>Name: Z to A</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Breadcrumb */}
        <nav aria-label='breadcrumb'>
          <ol className='breadcrumb'>
            <li className='breadcrumb-item'>
              <Link to='/'>Home</Link>
            </li>
            <li
              className={`breadcrumb-item  ${
                categoryId || productId ? "" : "active"
              }`}
            >
              {categoryId || productId ? (
                <Link to='/products'>All Products</Link>
              ) : (
                "All Products"
              )}
            </li>
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
                <span className='text-muted mx-2'>
                  {singleProduct.stock > 0 ? "Available" : "Unavailable"}
                </span>
              </div>
              <button
                className={`add-cart border-0`}
                onClick={() => {
                  setSelectedProduct(singleProduct);
                  setIsCartModalOpen(true);
                }}
                disabled={singleProduct.stock === 0}
              >
                {singleProduct.stock > 0 ? (
                  <>
                    Add to Cart <i className='fas fa-shopping-cart'></i>
                  </>
                ) : (
                  <>
                    Out of Stock <i className='fas fa-ban'></i>
                  </>
                )}
              </button>
            </div>
            <div className='col-md-4 position-relative'>
              <img
                src={singleProduct.imageUrl}
                alt={singleProduct.name}
                className='img-fluid'
              />
              <button
                className='single-view-favorite'
                onClick={() => toggleFavorite(singleProduct)}
              >
                <i
                  className={`${
                    favorites.some((fav) => fav.id === singleProduct.id)
                      ? "fas fa-heart checked"
                      : "far fa-heart"
                  }`}
                ></i>
              </button>
            </div>
            <SimilarProducts
              userId={userId}
              selectedProductId={productId}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
            />
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
                      <div className='card-body d-flex flex-column justify-content-between p-4 position-relative'>
                        <button
                          className='favorite'
                          onClick={() => toggleFavorite(product)}
                        >
                          <i
                            className={`${
                              favorites.some((fav) => fav.id === product.id)
                                ? "fas fa-heart checked"
                                : "far fa-heart"
                            }`}
                          ></i>
                        </button>
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
                          <span className='text-muted mx-2'>
                            {product.stock > 0 ? "Available" : "Unavailable"}
                          </span>
                        </div>
                        <div className='d-flex justify-content-evenly'>
                          <button
                            className={`add-cart border-0`}
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsCartModalOpen(true);
                            }}
                            disabled={product.stock === 0}
                          >
                            {product.stock > 0 ? (
                              <>
                                Add to Cart{" "}
                                <i className='fas fa-shopping-cart'></i>
                              </>
                            ) : (
                              <>
                                Out of Stock <i className='fas fa-ban'></i>
                              </>
                            )}
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

      {/* Country Selection Modal */}
      <Modal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        title='Select Country'
        confirmText={
          isSaving ? (
            <span className='spinner-border spinner-border-sm'></span>
          ) : (
            "Confirm"
          )
        }
        confirmDisabled={isSaving || !selectedCountry}
        closeText='Cancel'
        onConfirm={handleConfirmCountry}
      >
        <div className='row'>
          <div className='col-12'>
            <h5>Country</h5>
            <select
              className='form-select'
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value=''>Select a country</option>
              <option value='0'>Tanta</option>
              <option value='1'>Cairo</option>
              <option value='2'>UpperEgypt</option>
              <option value='3'>Alexadria</option>
              <option value='4'>Mansoura</option>
            </select>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default Shop;
