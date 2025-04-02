import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "./Loading";
import Modal from "./Modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { API_BASE_URL } from "../config";

const SimilarProducts = ({
  userId,
  selectedProductId,
  toggleFavorite,
  favorites,
}) => {
  const { categoryId } = useParams(); // Get categoryId from URL
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Loader state
  const [selectedCountry, setSelectedCountry] = useState(""); // Track selected country
  const [selectedProduct, setSelectedProduct] = useState(null); // Track selected product

  useEffect(() => {
    if (!userId || !categoryId) return;

    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/Product/Recommended/${userId}/${categoryId}`
        );
        if (!response.ok)
          throw new Error("Failed to fetch recommended products");

        let data = await response.json();

        // Exclude the selected product
        data = data.filter((product) => product.id !== selectedProductId);

        // Shuffle the array randomly
        const shuffled = data.sort(() => 0.5 - Math.random());

        // Pick 3 random products
        setSimilarProducts(shuffled.slice(0, 3));
      } catch (error) {
        console.error("Error fetching similar products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [userId, categoryId, selectedProductId]);

  const addToCart = async (product, countryCode) => {
    setIsSaving(true);

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
          `${API_BASE_URL}/Cart/AddItem/${cartId}?delivery=${countryCode}`,
          { method: "POST", headers: { "Content-Type": "application/json" } }
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

      if (!addItemResponse.ok) throw new Error("Failed to add item to cart");

      // Decrement stock locally
      const updatedProducts = similarProducts.map((p) =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      );

      setSimilarProducts(updatedProducts); // Update main products list

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
      addToCart(selectedProduct, selectedCountry);
    }
  };

  return (
    <div className='similar-products'>
      <h2>Similar Products</h2>
      <div className='row' id='similarProducts'>
        {loading ? (
          <Loading />
        ) : similarProducts.length === 0 ? (
          <p>No similar products found.</p>
        ) : (
          similarProducts.map((product) => (
            <div key={product.id} className='col-sm-6 col-md-4 mb-4'>
              <div className='card product-box h-100'>
                <img
                  src={product.imageUrl || "/assets/default-product.jpg"}
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
                  <div className='d-flex justify-content-between'>
                    <h5 className='card-title'>{product.name}</h5>
                    <span className='product-price'>{product.price}EGP</span>
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
                          Add to Cart <i className='fas fa-shopping-cart'></i>
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
    </div>
  );
};

export default SimilarProducts;
