import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Show loader
    // Validation
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await fetch(
        "https://nshopping.runasp.net/api/Users/Login",
        {
          method: "POST",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.id);

        setLoading(false);
        navigate("/");
      } else {
        setError(data.message || "Invalid email or password.");
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

  return (
    <div className='container'>
      {loading && <Loader />}
      <div className='main mx-auto'>
        <h1>Login</h1>
        {error && <div className='alert alert-danger'>{error}</div>}

        <form onSubmit={handleSubmit} id='loginForm'>
          <div className='mb-3'>
            <label className='form-label'>Email:</label>
            <input
              type='email'
              className='form-control'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className='mb-3'>
            <label className='form-label'>Password:</label>
            <input
              type='password'
              className='form-control'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
