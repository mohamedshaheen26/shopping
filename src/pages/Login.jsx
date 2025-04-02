import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

import { API_BASE_URL } from "../config";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]); // State to store all users
  const navigate = useNavigate();

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Users/All Users`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data); // Store all users in state
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Show loader

    // Validation
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    // Check if email exists in the users list
    const userExists = users.some((user) => user.email === email);
    if (!userExists) {
      setError("Email does not exist. Please register first.");
      setLoading(false);
      return;
    }

    // Proceed with login
    try {
      const response = await fetch(`${API_BASE_URL}/Users/Login`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.id);
        localStorage.setItem(
          "userName",
          `${data.firstName + " " + data.lastName}`
        );
        localStorage.setItem("firstLogin", "true");

        setLoading(false);
        navigate("/");
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      setError("An error occurred while processing your request.");
    } finally {
      setLoading(false); // Hide loader
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle the state
  };

  return (
    <div className='container'>
      {loading && <Loader />}
      <div className='main mx-auto'>
        <h1>Login</h1>
        {error && <div className='alert alert-danger'>{error}</div>}

        <form onSubmit={handleSubmit} id='loginForm'>
          <div className='col-md-12 mb-2'>
            <label className='form-label'>Email:</label>
            <input
              type='email'
              className='form-control'
              value={email.toLocaleLowerCase()}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className='col-md-12'>
            <label className='form-label'>Password:</label>
            <div className='input-group mb-3'>
              <input
                type={showPassword ? "text" : "password"}
                className='form-control'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className='input-group-text'>
                <i
                  className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  onClick={togglePasswordVisibility}
                ></i>
              </span>
            </div>
          </div>
          <button type='submit' className='btn btn-primary' disabled={loading}>
            Login
          </button>
        </form>
        <p className='text-center mb-0'>
          Don't have an account?{" "}
          <Link to='/register' className='text-warning'>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
