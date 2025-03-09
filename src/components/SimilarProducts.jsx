import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "./Alert";

const SimilarProducts = ({ userId, selectedProductId }) => {
  const { categoryId } = useParams(); // Get categoryId from URL
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(""), 3000);
  };
  useEffect(() => {
    if (!userId || !categoryId) return;

    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://nshopping.runasp.net/api/Product/Recommended/${userId}/${categoryId}`
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

  const addToCart = async (product) => {
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
    <div className='similar-products'>
      {alertMessage && <Alert message={alertMessage} type={alertType} />}
      <h2>Similar Products</h2>
      <div className='row' id='similarProducts'>
        {loading ? (
          <p>Loading...</p>
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
                <div className='card-body d-flex flex-column justify-content-between p-4'>
                  <div className='d-flex justify-content-between'>
                    <h5 className='card-title'>{product.name}</h5>
                    <span className='product-price'>{product.price}EGP</span>
                  </div>
                  <div className='text-warning mb-3'>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <i
                        key={index}
                        className={
                          index < product.rating ? "fas fa-star" : "far fa-star"
                        }
                      ></i>
                    ))}
                    <span className='text-muted'> Available</span>
                  </div>
                  <div className='d-flex justify-content-evenly'>
                    <button
                      className={`add-cart border-0 ${
                        product.stock > 0 ? "" : "disabled"
                      }`}
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      Add to Cart <i className='fas fa-shopping-cart'></i>
                    </button>
                    <Link
                      tto={`/products/${product.categoryId}/${product.id}`}
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
    </div>
  );
};

export default SimilarProducts;
