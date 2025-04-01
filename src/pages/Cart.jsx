import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";
import OrderSuccessPopup from "../components/OrderSuccessPopup";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { API_BASE_URL } from "../config";

const Cart = ({ cartItems, setCartItems }) => {
  const [cartId, setCartId] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const userId = localStorage.getItem("userId");
  const [region, setRegion] = useState("");
  const [showRegion, setShowRegion] = useState(false);
  const [cartFromServer, setCartFromServer] = useState(null);
  const navigate = useNavigate();

  // const fetchProductImage = async (productId) => {
  //   try {
  //     const response = await fetch(
  //       `${API_BASE_URL}/Product/${productId}`
  //     );
  //     if (response.ok) {
  //       const product = await response.json();
  //       return product.imageUrl || "/assets/default-product.png"; // Default image fallback
  //     }
  //   } catch (error) {
  //     console.error("Error fetching product image:", error);
  //   }
  //   return "/assets/default-product.png"; // Fallback in case of error
  // };
  // console.log(cartItems);

  const fetchDiscount = async () => {
    if (!cartItems.length) return;

    // Group items by category
    const categoryTotals = cartItems.reduce((acc, item) => {
      if (!acc[item.categoryId]) {
        acc[item.categoryId] = { quantity: 0, totalPrice: 0 };
      }
      acc[item.categoryId].quantity += item.quantity;
      acc[item.categoryId].totalPrice += item.price * item.quantity;
      return acc;
    }, {});

    let totalDiscount = 0;
    let updatedFinalPrice = subtotal;

    try {
      // Fetch discount for each category separately
      for (const [categoryId, { quantity, totalPrice }] of Object.entries(
        categoryTotals
      )) {
        const response = await fetch(
          `${API_BASE_URL}/Offer/apply-discount?categoryId=${categoryId}&quantity=${quantity}&totalPrice=${totalPrice}`
        );

        if (response.ok) {
          const data = await response.json();

          if (data.finalPrice !== undefined) {
            const categoryDiscount = totalPrice - data.finalPrice; // Compute discount for this category
            totalDiscount += categoryDiscount;
            updatedFinalPrice -= categoryDiscount;
          }
        } else {
          console.error(`Failed to fetch discount for category ${categoryId}`);
        }
      }

      // Apply total discount to cart
      setDiscount(totalDiscount);
      updateCartTotals(cartItems, totalDiscount, updatedFinalPrice);
    } catch (error) {
      console.error("Error fetching discount:", error);
    }
  };

  // Load cart on component mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);

        // Fetch cart from the server
        const response = await fetch(
          `${API_BASE_URL}/Cart/GetByUser/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const serverCart = await response.json();

          if (serverCart.cartItems.length > 0) {
            // Fetch category for each product
            const updatedCartItems = await Promise.all(
              serverCart.cartItems.map(async (item) => {
                // Fetch product details to get categoryId
                const productResponse = await fetch(
                  `${API_BASE_URL}/Product/${item.productId}`
                );
                if (productResponse.ok) {
                  const product = await productResponse.json();
                  return {
                    ...item,
                    imageUrl: product.imageUrl || "/assets/default-product.png",
                    categoryId: product.categoryId, // Add categoryId to the item
                  };
                }
                return {
                  ...item,
                  imageUrl: "/assets/default-product.png", // Fallback image
                  categoryId: null, // Fallback categoryId
                };
              })
            );

            setCartFromServer(serverCart);
            setCartId(serverCart.id);
            setShippingCost(serverCart.deliveryCost || 0);
            setDiscount(serverCart.discountApplied || 0);
            setCartItems(updatedCartItems);
            updateCartTotals(updatedCartItems);
            localStorage.setItem(`cart_${userId}`, JSON.stringify(serverCart));
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching cart from server:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userId]);

  // Watch for cartItems changes
  useEffect(() => {
    if (cartItems.length) {
      fetchDiscount();
    }
  }, [cartItems]);

  // Function to update cart totals
  const updateCartTotals = (
    items,
    appliedDiscount = discount,
    finalPrice = subtotal
  ) => {
    const newSubtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const newTotal = finalPrice + shippingCost; // Use API's finalPrice

    setSubtotal(newSubtotal);
    setTotal(newTotal);
    setDiscount(appliedDiscount); // Keep the discount updated

    // Update cartFromServer with the new totals
    if (cartFromServer) {
      setCartFromServer({
        ...cartFromServer,
        totalPrice: newSubtotal,
        discountApplied: appliedDiscount,
        finalPrice: newTotal,
      });
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    const cartKey = `cart_${userId}`;
    const updatedCart = cartItems.filter((item) => item.id !== cartItemId);

    // Update localStorage
    localStorage.setItem(cartKey, JSON.stringify({ cartItems: updatedCart }));
    setCartItems([...updatedCart]);
    updateCartTotals(updatedCart);

    // Remove from server
    try {
      await fetch(`${API_BASE_URL}/Cart/RemoveItem/${cartId}/${cartItemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Update cartFromServer after removing the item
      const updatedCartFromServer = {
        ...cartFromServer,
        cartItems: updatedCart,
        totalPrice: subtotal,
        discountApplied: discount,
        finalPrice: total,
      };
      setCartFromServer(updatedCartFromServer);
    } catch (error) {
      console.error("Error removing item from server cart:", error);
    }
  };

  // Update item quantity
  const updateCartItemQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const cartKey = `cart_${userId}`;

    // Update only quantity while keeping other properties
    const updatedCart = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );

    // Save updated cart to localStorage
    localStorage.setItem(cartKey, JSON.stringify({ cartItems: updatedCart }));

    // Update state
    setCartItems(updatedCart);
    updateCartTotals(updatedCart);

    // Send update request to server
    // try {
    //   await fetch(`${API_BASE_URL}/Cart/Update`, {
    //     method: "PUT",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${localStorage.getItem("token")}`,
    //     },
    //     body: JSON.stringify({
    //       userId,
    //       productId: itemId,
    //       quantity: newQuantity,
    //     }),
    //   });
    // } catch (error) {
    //   console.error("Error updating item quantity in server cart:", error);
    // }
  };

  const checkout = () => {
    setShowRegion(true);
  };

  // Checkout function
  const placeOrder = async () => {
    if (!userId) {
      toast.warning(`You must be logged in to checkout`, {
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        closeButton: false,
      });
      return;
    }

    const orderPayload = {
      userId,
      items: cartItems.map(({ productId, quantity }) => ({
        productId,
        quantity,
      })),
      region: region,
    };

    for (const item of cartItems) {
      if (!item.productId || item.quantity <= 0) {
        toast.success(`Invalid product ID or quantity.`, {
          position: "top-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          closeButton: false,
        });
        return;
      }
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/Order/Create?region=${region}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(orderPayload),
        }
      );

      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text(); // Read the response as plain text
        console.error("Non-JSON response:", errorText); // Log the error
        throw new Error(errorText); // Throw the plain text error
      }

      const data = await response.json(); // Parse JSON only if the content type is correct

      if (!response.ok) {
        console.error("Server error:", data); // Log the server's error response
        throw new Error(data.message || "Failed to complete the purchase");
      }

      // Clear cart after successful checkout
      await clearCart();

      localStorage.removeItem("cart"); // Clear local storage
      setCartItems([]);
      updateCartTotals([]);

      setShowModal(true); // Show success modal
      setShowRegion(false);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(`Failed to complete the purchase. Please try again.`, {
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

  const clearCart = async () => {
    try {
      for (const item of cartItems) {
        const response = await fetch(
          `${API_BASE_URL}/Cart/RemoveItem/${cartId}/${item.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to remove item from cart:", errorData);
          throw new Error("Failed to clear cart");
        }
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error; // Re-throw the error to handle it in the checkout function
    }
  };

  return (
    <section className='cart'>
      <ToastContainer style={{ zIndex: 99999999 }} />

      <OrderSuccessPopup
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          navigate("/orderDetails");
        }}
      />
      <div className='container'>
        {loading ? (
          <Loading />
        ) : cartItems.length > 0 ? (
          <>
            <h1 className='text-center'>Your Cart</h1>
            <div className='cart-content'>
              <div className='row'>
                <div className='col-md-9'>
                  <div className='table-responsive'>
                    <table className='table mb-0'>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th className='text-center'>Price</th>
                          <th className='text-center'>Quantity</th>
                          <th className='text-center'>Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr key={item.id}>
                            <td className='w-50'>
                              <div className='d-flex align-items-center'>
                                <img
                                  src={item.imageUrl}
                                  alt='Product Images'
                                  height='100'
                                  width='100'
                                  className='me-3'
                                />
                                <h6>{item.productName}</h6>
                              </div>
                            </td>
                            <td className='text-center align-middle'>
                              {item.price}EGP
                            </td>
                            <td className='align-middle'>
                              <div className='quantity-container d-flex justify-content-between align-items-center gap-2 px-2'>
                                <button
                                  className='quantity'
                                  onClick={() =>
                                    updateCartItemQuantity(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={item.quantity === 1}
                                >
                                  -
                                </button>
                                <span className='mx-2'>{item.quantity}</span>
                                <button
                                  className='quantity'
                                  onClick={() =>
                                    updateCartItemQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className='text-center align-middle'>
                              {item.price * item.quantity}EGP
                            </td>
                            <td className='text-center align-middle'>
                              <button
                                className='btn btn-sm del-cartItem'
                                onClick={() => removeFromCart(item.id)}
                              >
                                ✖
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className='col-md-3'>
                  <div className='card-body p-0 checkout'>
                    <table className='table table-borderless mb-0'>
                      <thead>
                        <tr>
                          <th
                            colSpan='2'
                            className='fs-5 text-black'
                            scope='col'
                          >
                            Order Summary
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Items</td>
                          <td className='text-center fw-bold'>
                            {cartItems.reduce(
                              (total, item) => total + item.quantity,
                              0
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Subtotal</td>
                          <td className='text-center fw-bold'>
                            {cartFromServer?.totalPrice}EGP
                          </td>
                        </tr>
                        <tr>
                          <td>Shipping</td>
                          <td className='text-center fw-bold'>
                            {cartFromServer?.deliveryCost}EGP
                          </td>
                        </tr>
                        <tr>
                          <td>Discount</td>
                          <td className='text-center fw-bold'>
                            {cartFromServer?.discountApplied ?? discount}EGP
                          </td>
                        </tr>
                        <tr className='fw-bold'>
                          <td>Total Price</td>
                          <td className='text-center fw-bold'>
                            {cartFromServer?.finalPrice}EGP
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {showRegion && (
                    <div className='card-body mt-3 p-2 checkout'>
                      <label className='form-label'>Select Region</label>
                      <select
                        className='form-select'
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                      >
                        <option value=''>Select</option>
                        <option value='0'>Tanta</option>
                        <option value='1'>Cairo</option>
                        <option value='2'>UpperEgypt</option>
                        <option value='3'>Alexadria</option>
                        <option value='4'>Mansoura</option>
                      </select>
                    </div>
                  )}
                  {showRegion ? (
                    <button
                      className='btn btn-primary btn-buy w-100'
                      onClick={placeOrder}
                    >
                      Place Your Order
                    </button>
                  ) : (
                    <button
                      className='btn btn-primary btn-buy w-100'
                      onClick={checkout}
                    >
                      Checkout
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className='text-center my-5'>
            <img
              src='../../assets\empty-shopping-cart.png'
              width={200}
              alt='Empty Cart'
            />
            <h3 className='fw-bold my-2'>Your cart is empty</h3>
            <a href='/products' className='hero-button'>
              Start shopping!
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cart;
