import React, { useEffect, useState } from "react";

import { API_BASE_URL } from "../config";
import Loading from "../components/Loading";

const OrderDetails = () => {
  const [cart, setCart] = useState(null);
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Order/User/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch cart");
        const orders = await response.json();

        if (orders.length > 0) {
          const lastOrder = orders[orders.length - 1]; // Get the last order
          setOrder(lastOrder);
        }
      } catch (error) {
        console.error("Error fetching cart details:", error);
      }
    };
    fetchOrder();
  }, [userId]);

  // Fetch cart details
  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/Cart/GetByUser/${userId}`
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
          `${API_BASE_URL}/Cart/${cart.id}/tracking`
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

  // Function to convert date difference to human-readable format
  function convertToHumanReadableDate(dateString) {
    const targetDate = new Date(dateString);
    const currentDate = new Date();

    // Calculate the difference in time (in milliseconds)
    const timeDifference = targetDate - currentDate;

    // Convert time difference to days
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (daysDifference === 0) {
      return "Today";
    } else if (daysDifference === 1) {
      return "1 day";
    } else if (daysDifference < 0) {
      return `${Math.abs(daysDifference)} days`;
    } else {
      return `${daysDifference} days`;
    }
  }

  return (
    <section className='order-details pb-5'>
      <div className='container'>
        {loading ? (
          <Loading />
        ) : (
          <>
            {/* ✅ Empty Cart Message */}
            {!order && (
              <div className='text-center'>
                <img
                  src='/assets/empty.webp' // Make sure this path is correct
                  alt='Empty Orders'
                  className='img-fluid'
                  width='300'
                />
                <div className='alert alert-info mt-3'>
                  You have no orders yet.
                </div>
              </div>
            )}
            {/* ✅ Show orders only if cart has items */}
            {order && order.items && order.items.length > 0 && (
              <>
                <h1 className='text-center'>Orders</h1>

                <div className='mt-4 p-4 shadow-lg rounded bg-white'>
                  <h2 className='fw-bold'>Order #{order?.id || "N/A"}</h2>

                  <div className='mt-3'>
                    <h4 className='fw-bold'>Order Details:</h4>
                    <ul className='ms-4'>
                      <li>
                        <strong>Region:</strong>{" "}
                        <span className='text-muted'>{order?.region}</span>
                      </li>
                      <li>
                        <strong>Delivery Status:</strong>{" "}
                        <span className='text-primary'>
                          {order?.status || "N/A"}
                        </span>
                      </li>
                      <li>
                        <strong>Estimated Delivery:</strong>{" "}
                        <span className='text-success'>
                          {order?.status !== "Canceled"
                            ? convertToHumanReadableDate(
                                order?.estimatedDeliveryTime
                              )
                            : "---"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* ✅ Products in the Order */}
                  <h4 className='fw-bold mt-4'>Products in this Order:</h4>
                  {order.items
                    .filter((item) => item.price > 0 && item.totalPrice > 0)
                    .map((item) => (
                      <div
                        key={item.id}
                        className='mt-3 border-bottom pb-3 d-flex flex-column flex-lg-row align-items-start gap-3'
                      >
                        {/* ✅ Display Product Image */}
                        {/* <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className='rounded bg-light'
                    width='124'
                    height='124'
                  /> */}
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
                      <span className='text-dark'>${order?.totalAmount}</span>
                    </h4>
                    <h4 className='fw-semibold'>
                      Delivery Cost:{" "}
                      <span className='text-dark'>${cart?.deliveryCost}</span>
                    </h4>
                    <h4 className='fw-semibold'>
                      Final Price:{" "}
                      <span className='text-danger'>
                        ${order?.totalAmount + cart?.deliveryCost}
                      </span>
                    </h4>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default OrderDetails;
