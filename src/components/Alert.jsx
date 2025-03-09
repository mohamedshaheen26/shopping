import React, { useState, useEffect } from "react";

const Alert = ({ message, type }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
      }, 2000);
    }
  }, [message]);

  return (
    <div
      className={`alert alert-${type} alert-dismissible fade ${
        visible ? "show" : "hide"
      }`}
      role='alert'
      style={{
        position: "fixed",
        top: "80px",
        left: visible ? "20px" : "-500px",
        transition: "left 0.5s ease-in-out",
        zIndex: 1000,
      }}
    >
      {message}
    </div>
  );
};

export default Alert;
