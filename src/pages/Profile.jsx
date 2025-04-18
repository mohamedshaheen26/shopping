import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../config";
import Loading from "../components/Loading";

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    nationalID: "",
    phoneNumber: "",
    password: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");
  const [showPersonalInfo, setShowPersonalInfo] = useState(true);
  const [supportData, setSupportData] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  // Load user data only once on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/Users/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          nationalID: userData.nationalID || "",
          phoneNumber: userData.phoneNumber || "",
          password: "", // Initialize password as empty
        });
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setFormData((prev) => ({
      ...prev,
      password: "", // Clear password field on cancel
    }));
    setEditMode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare the data for API
      const updateData = { ...formData };

      // Don't send password if it's empty (no change)
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await fetch(`${API_BASE_URL}/Users/${userId}Update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }

      // Update local storage if name changed
      localStorage.setItem(
        "userName",
        `${formData.firstName} ${formData.lastName}`
      );

      toast.success("Profile updated successfully!");
      setEditMode(false);
      // Clear password field after successful update
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Support/all`);
      if (!response.ok) throw new Error("Failed to fetch support data");

      const data = await response.json();
      setSupportData(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Fetch support data
  useEffect(() => {
    fetchSupportData();
  }, []);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const time = new Intl.DateTimeFormat("default", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    return isToday ? `Today ${time}` : `${date.toLocaleDateString()} ${time}`;
  };

  const handleSendMessage = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Support/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          message: messageInput,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      fetchSupportData();

      toast.success(`Message sent successfully!`, {
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        closeButton: false,
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setMessageInput("");
    }
  };

  return (
    <section className='profile pb-5'>
      <div className='container'>
        <ul className='nav nav-tabs border-0 mt-2 p-0 pt-4'>
          <li className='nav-item'>
            <button
              className={`nav-link ${showPersonalInfo && "active"}`}
              aria-current='page'
              onClick={() => setShowPersonalInfo(true)}
            >
              Personal Info
            </button>
          </li>
          <li className='nav-item'>
            <button
              className={`nav-link ${!showPersonalInfo && "active"}`}
              onClick={() => setShowPersonalInfo(false)}
            >
              Customer Service
            </button>
          </li>
        </ul>

        {showPersonalInfo ? (
          <div className='p-4 shadow-lg rounded bg-white'>
            <h1>Profile</h1>
            <p>Update Your Personal Details or Password Below.</p>

            {loading && !editMode ? (
              <Loading />
            ) : (
              <form className='row g-3' onSubmit={handleSubmit}>
                {/* Personal Info Fields */}
                <div className='col-6'>
                  <label htmlFor='firstName' className='form-label'>
                    First Name
                  </label>
                  <input
                    type='text'
                    className='form-control'
                    id='firstName'
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div className='col-6'>
                  <label htmlFor='lastName' className='form-label'>
                    Last Name
                  </label>
                  <input
                    type='text'
                    className='form-control'
                    id='lastName'
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div className='col-md-6'>
                  <label htmlFor='email' className='form-label'>
                    Email
                  </label>
                  <input
                    type='email'
                    className='form-control'
                    id='email'
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div className='col-md-6'>
                  <label htmlFor='nationalID' className='form-label'>
                    National ID
                  </label>
                  <input
                    type='text'
                    className='form-control'
                    id='nationalID'
                    value={formData.nationalID}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
                <div className='col-md-6'>
                  <label htmlFor='phoneNumber' className='form-label'>
                    Phone Number
                  </label>
                  <input
                    type='text'
                    className='form-control'
                    id='phoneNumber'
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>

                {/* Password Field Only */}
                <div className='col-md-6'>
                  <label htmlFor='password' className='form-label'>
                    New Password
                  </label>
                  <input
                    type='password'
                    className='form-control'
                    id='password'
                    value={formData.password}
                    onChange={handleChange}
                    disabled={!editMode}
                    placeholder={editMode ? "Enter new password" : "••••••••"}
                  />
                </div>

                {/* Action Buttons */}
                <div className='col-12 d-flex gap-2'>
                  {!editMode ? (
                    <button
                      type='button'
                      className='btn btn-primary'
                      onClick={handleEditClick}
                    >
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        type='submit'
                        className='btn btn-success'
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Save Changes"}
                      </button>
                      <button
                        type='button'
                        className='btn btn-outline-secondary'
                        onClick={handleCancelClick}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className='p-4 shadow-lg rounded bg-white call-center'>
            <div className='row'>
              <div className='col-md-5 mb-4 d-flex justify-content-center align-items-center'>
                <img src='assets\message.png' alt='' />
              </div>
              <div className='col-md-7'>
                <section className='card border-0'>
                  <div className='card-body p-0'>
                    <div className='card-title mb-3 pb-2 px-3 border-bottom d-flex justify-content-between align-items-center'>
                      <h5 className='text-left mb-0'>
                        {localStorage.getItem("userName")}
                      </h5>
                      <i className='fas fa-ellipsis-v text-warning'></i>
                    </div>
                    <div
                      className='overflow-auto'
                      style={{ maxHeight: "400px" }}
                    >
                      {
                        /* Support Data Display */
                        [...supportData].reverse().map((item, index) => (
                          <React.Fragment key={index}>
                            <div className='d-flex flex-column align-items-end mb-3 mx-3'>
                              <div className='message'>{item.message}</div>
                              <span className='time'>
                                {formatTime(item.createdAt)}
                              </span>
                            </div>
                            {item.response && (
                              <div className='d-flex flex-column align-items-start mb-3 mx-3'>
                                <div className='response'>{item.response}</div>
                                <span className='time'>
                                  {formatTime(item.respondedAt)}
                                </span>
                              </div>
                            )}
                          </React.Fragment>
                        ))
                      }
                    </div>
                    <div className='msg-box'>
                      <div className='d-flex justify-content-between align-items-center gap-2'>
                        <input
                          type='text'
                          className='form-control submit-input'
                          placeholder='Type your message...'
                          id='messageInput'
                          onChange={(e) => setMessageInput(e.target.value)}
                          value={messageInput || ""}
                        />
                        <button
                          className='btn btn-primary submit-msg'
                          type='button'
                          onClick={handleSendMessage}
                        >
                          <i className='fas fa-paper-plane'></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;
