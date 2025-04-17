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

  return (
    <section className='profile pb-5'>
      <div className='container'>
        <div className='mt-4 p-4 shadow-lg rounded bg-white'>
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
      </div>
    </section>
  );
};

export default Profile;
