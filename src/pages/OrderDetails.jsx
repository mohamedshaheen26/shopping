import React, { useEffect, useState } from "react";

const OrderDetails = () => {
  const [cart, setCart] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  // Fetch cart details
  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        const response = await fetch(
          `https://nshopping.runasp.net/api/Cart/GetByUser/${userId}`
        );
        if (!response.ok) throw new Error("Failed to fetch cart");
        const data = await response.json();
        setCart(data);
      } catch (error) {
        console.error("Error fetching cart details:", error);
      }
    };

    fetchCartDetails();
  }, [userId]);

  // Fetch tracking details once cart is available
  useEffect(() => {
    if (!cart) return;

    const fetchTrackingData = async () => {
      try {
        const response = await fetch(
          `https://nshopping.runasp.net/api/Cart/${cart.id}/tracking`
        );
        if (!response.ok) throw new Error("Failed to fetch tracking data");
        const data = await response.json();
        setTracking(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tracking data:", error);
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [cart]);

  if (loading)
    return <h3 className='text-center mt-5'>Loading Order Details...</h3>;

  return (
    <section className='order-details'>
      <div className='container'>
        {/* ✅ Empty Cart Message */}
        {cart?.cartItems?.length === 0 && (
          <div className='text-center'>
            <img
              src='/assets/empty.webp' // Make sure this path is correct
              alt='Empty Orders'
              className='img-fluid'
              width='300'
            />
            <div className='alert alert-info mt-3'>You have no orders yet.</div>
          </div>
        )}

        {/* ✅ Show orders only if cart has items */}
        {cart?.cartItems?.length > 0 && (
          <>
            <h1 className='text-center'>Orders</h1>

            <div className='mt-4 p-4 shadow-lg rounded bg-white'>
              <h2 className='fw-bold'>Order #{cart?.id || "N/A"}</h2>

              <div className='mt-3'>
                <h4 className='fw-bold'>Order Details:</h4>
                <ul className='ms-4'>
                  <li>
                    <strong>Region:</strong>{" "}
                    <span className='text-muted'>{cart?.region}</span>
                  </li>
                  <li>
                    <strong>Delivery Status:</strong>{" "}
                    <span className='text-primary'>
                      {tracking?.status || "N/A"}
                    </span>
                  </li>
                  <li>
                    <strong>Estimated Delivery:</strong>{" "}
                    <span className='text-success'>
                      {tracking?.estimatedDeliveryTime || "N/A"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* ✅ Products in the Order */}
              <h4 className='fw-bold mt-4'>Products in this Order:</h4>
              {cart.cartItems.map((item) => (
                <div
                  key={item.id}
                  className='mt-3 border-bottom pb-3 d-flex flex-column flex-lg-row align-items-start gap-3'
                >
                  {/* ✅ Display Product Image */}
                  <img
                    src={item.imageUrl || "https://via.placeholder.com/124"}
                    alt={item.productName}
                    className='rounded bg-light'
                    width='124'
                    height='124'
                  />
                  <div>
                    <h5 className='fw-bold'>{item.productName}</h5>
                    <p>
                      <strong>Price:</strong>{" "}
                      <span className='text-muted'>${item.price}</span>
                    </p>
                    <p>
                      <strong>Quantity:</strong> {item.quantity}
                    </p>
                    <h5 className='fw-bold'>Total: ${item.totalPrice}</h5>
                  </div>
                </div>
              ))}

              {/* ✅ Order Summary */}
              <div className='mt-4 text-end'>
                <h4 className='fw-semibold'>
                  Subtotal:{" "}
                  <span className='text-dark'>${cart?.totalPrice}</span>
                </h4>
                <h4 className='fw-semibold'>
                  Delivery Cost:{" "}
                  <span className='text-dark'>${cart?.deliveryCost}</span>
                </h4>
                <h4 className='fw-semibold'>
                  Final Price:{" "}
                  <span className='text-danger'>${cart?.finalPrice}</span>
                </h4>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default OrderDetails;
