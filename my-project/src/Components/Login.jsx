import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_KEY;

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // for cookies
  axios.defaults.withCredentials = true;
  const handleSubmit = async (e) => {
    e.preventDefault();

    axios
      .post(`${API_BASE_URL}/api/user/fetch`, formData)
      .then((res) => {
        // console.log(res);
        if (res.data.login) {
          alert("Login successful!");
          navigate("/dashboard");
        } else {
          alert(`Login failed, ${res.data.message}`);
          navigate("/");
        }
      })
      .catch((err) => {
        alert(`${err.response.data.message}`);
        console.log(err);
      });

    // console.log("Form submitted:", formData);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-md text-2xl"
        onSubmit={handleSubmit}
      >
        <h2 className="text-4xl font-bold text-center mb-6">Login</h2>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-2xl font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-2xl font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Login
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-lg text-black">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Register
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
