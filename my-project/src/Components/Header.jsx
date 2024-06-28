import React, { useState } from 'react';
import logo from '../assets/images/logo.png'; // Import your logo image

const Header = () => {
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <header>
      <nav className="navbar">
        <div className="image-logo">
          <a href="./index.html">
            <img src={logo} alt="Logo" height="36px" width="36px" />
          </a>
          <a href="./index.html">
            <span className="logo">TeleGames</span>
          </a>
        </div>
        <ul className={`nav-menu ${menuActive ? 'active' : ''}`}>
          <li className="nav-item">
            <a href="#home" className="nav-link"><i className="fa fa-home" aria-hidden="true"></i> Home</a>
          </li>
          <li className="nav-item">
            <a href="#games" className="nav-link"><i className="fa-solid fa-circle-info" aria-hidden="true"></i> Games</a>
          </li>
          <li className="nav-item">
            <a href="#about" className="nav-link"><i className="fa fa-calculator" aria-hidden="true"></i> About</a>
          </li>
          <li className="nav-item">
            <a href="#contact" className="nav-link"><i className="fa fa-phone" aria-hidden="true"></i> Contact</a>
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
