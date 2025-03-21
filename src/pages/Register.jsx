import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

import { API_BASE_URL } from "../config";

const Register = () => {
  const navigate = useNavigate(); // To navigate after successful registration
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    nationalID: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Form validation
  const validateForm = () => {
    let errors = {};
    let isValid = true;

    // First Name Validation
    if (!formData.firstName || formData.firstName.length < 2) {
      errors.firstName = "First Name must be at least 2 characters.";
      isValid = false;
    }

    // Last Name Validation
    if (!formData.lastName || formData.lastName.length < 2) {
      errors.lastName = "Last Name must be at least 2 characters.";
      isValid = false;
    }

    // Email Validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailPattern.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
      isValid = false;
    }

    // Password Validation
    const { password } = formData;
    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
      isValid = false;
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter.";
      isValid = false;
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Password must contain at least one lowercase letter.";
      isValid = false;
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Password must contain at least one number.";
      isValid = false;
    } else if (!/[@]/.test(password)) {
      errors.password =
        "Password must contain at least one special character (@).";
      isValid = false;
    }

    // National ID Validation
    if (!/^\d{14}$/.test(formData.nationalID)) {
      errors.nationalID = "National ID must be exactly 14 digits.";
      isValid = false;
    }

    // Phone Number Validation
    if (!/^\d{11}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone Number must be exactly 11 digits.";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const userData = {
      ...formData,
      createdDate: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/Users/Register`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setLoading(false);
        navigate("/login");
      } else {
        console.error("Registration failed. Try Again");
      }
    } catch (error) {
      console.error("Error during registration:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle the state
  };

  return (
    <div className='container'>
      {loading && <Loader />}
      <div className='main mx-auto'>
        <h1>Create an Account</h1>

        <form onSubmit={handleSubmit} id='registerForm' noValidate>
          <div className='row'>
            {/* First Name */}
            <div className='col-md-6 mb-2'>
              <label className='form-label'>First Name:</label>
              <input
                className='form-control'
                type='text'
                name='firstName'
                value={formData.firstName}
                onChange={handleChange}
                required
                minLength='2'
              />
              {errors.firstName && (
                <div className='error-message'>{errors.firstName}</div>
              )}
            </div>

            {/* Last Name */}
            <div className='col-md-6 mb-2'>
              <label className='form-label'>Last Name:</label>
              <input
                className='form-control'
                type='text'
                name='lastName'
                value={formData.lastName}
                onChange={handleChange}
                required
                minLength='2'
              />
              {errors.lastName && (
                <div className='error-message'>{errors.lastName}</div>
              )}
            </div>

            {/* Email */}
            <div className='col-md-12 mb-2'>
              <label className='form-label'>Email:</label>
              <input
                className='form-control'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <div className='error-message'>{errors.email}</div>
              )}
            </div>

            {/* Password */}
            <div className='col-md-12 mb-2'>
              <label className='form-label'>Password:</label>
              <div className='input-group mb-3'>
                <input
                  className='form-control'
                  type={showPassword ? "text" : "password"}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength='6'
                />
                <span className='input-group-text'>
                  <i
                    className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                    onClick={togglePasswordVisibility}
                  ></i>
                </span>
              </div>
              {errors.password && (
                <div className='error-message'>{errors.password}</div>
              )}
            </div>

            {/* National ID */}
            <div className='col-md-6 mb-2'>
              <label className='form-label'>National ID:</label>
              <input
                className='form-control'
                type='number'
                name='nationalID'
                value={formData.nationalID}
                onChange={handleChange}
                required
              />
              {errors.nationalID && (
                <div className='error-message'>{errors.nationalID}</div>
              )}
            </div>

            {/* Phone Number */}
            <div className='col-md-6 mb-2'>
              <label className='form-label'>Phone Number:</label>
              <input
                className='form-control'
                type='number'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              {errors.phoneNumber && (
                <div className='error-message'>{errors.phoneNumber}</div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button type='submit' className='btn btn-primary' disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className='text-center mb-0'>
          Already have an account?{" "}
          <Link to='/login' className='text-warning'>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
