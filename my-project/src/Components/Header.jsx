import React, { useEffect, useState } from "react";
import logo from "../assets/images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_KEY;
const Header = () => {
  const [menuActive, setMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  // Check if the user is logged in by making a request to the backend
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user/dashboard`, {
          withCredentials: true, // Include cookies in the request
        });
        if (res.data.valid) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, [isLoggedIn]);

  // loggint out api req
  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/user/logout`,
        {},
        {
          withCredentials: true, // Include cookies in the request
        }
      );

      if (res.status === 200) {
        alert("Logout successful!");
        setIsLoggedIn(false);
        navigate("/"); // Redirect to home or login page after logout
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally, show an error message to the user
    }
  };

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <header>
      <nav className="navbar">
        <div className="image-logo">
          <a href="#">
            <img src={logo} alt="Logo" height="36px" width="36px" />
          </a>
          <a href="#">
            <span className="logo">TeleGames</span>
          </a>
        </div>
        <ul
          className={`nav-menu ${menuActive ? "active" : ""} items-center px-4`}
        >
          <li className="nav-item">
            <Link to={"/"} className="nav-link">
              <i className="fa fa-home" aria-hidden="true"></i> Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to={"/games"} className="nav-link">
              <i className="fa-solid fa-circle-info" aria-hidden="true"></i>{" "}
              Games
            </Link>
          </li>
          <li className="nav-item">
            <Link to={"/addgame"} className="nav-link">
              <i className="fa fa-phone" aria-hidden="true"></i> Add Games
            </Link>
          </li>
          <li className="nav-item">
            <Link to={"/about"} className="nav-link">
              <i className="fa fa-calculator" aria-hidden="true"></i> About
            </Link>
          </li>
          <li className="nav-item">
            <Link to={"/contact"} className="nav-link">
              <i className="fa fa-phone" aria-hidden="true"></i> Contact
            </Link>
          </li>

          <li className="nav-item">
            <Link to={"/dashboard"} className="nav-link">
              <i className="fa fa-phone" aria-hidden="true"></i> Dashboard
            </Link>
          </li>

          {/* Conditionally render login/register or logout */}
          {isLoggedIn ? (
            <li className="nav-item">
              <Link onClick={handleLogout} className="nav-link">
                <i className="fa fa-phone" aria-hidden="true"></i> Logout
              </Link>
            </li>
          ) : (
            <li className="nav-item">
              <Link to={"/register"} className="nav-link">
                <i className="fa fa-phone" aria-hidden="true"></i>{" "}
                Login/Register
              </Link>
            </li>
          )}

          <li className="nav-item" style={{ fontSize: "1.5rem" }}>
            <ConnectButton />
          </li>
        </ul>
        <div className="hamburger" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </nav>
    </header>
  );
};

export default Header;
