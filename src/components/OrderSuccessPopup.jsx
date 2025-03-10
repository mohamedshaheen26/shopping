import React from "react";
import { Modal, Button } from "react-bootstrap";

const OrderSuccessPopup = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Body className='text-center'>
        {/* Success Icon */}
        <div className='mb-3'>
          <i
            className='bi bi-check-circle-fill text-success'
            style={{ fontSize: "3rem" }}
          ></i>
        </div>

        {/* Title */}
        <h2>Your order was added successfully</h2>

        {/* Description */}
        <p>Thanks for choosing Vé.a</p>

        {/* Close Button */}
        <Button variant='success' onClick={handleClose}>
          OK
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default OrderSuccessPopup;
