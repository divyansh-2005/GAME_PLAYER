/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import logo from "../assets/images/logo (3).png";
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <header>
      <nav className="navbar">
        <div className="image-logo">
          <a href="https://game-player-navy.vercel.app/">
            <img src={logo} alt="Logo" height="180px" width="180px" />
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

          <li className="nav-item" style={{ fontSize: "2rem" }}>
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
