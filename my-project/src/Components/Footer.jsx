import React from 'react';

const Footer = () => (
  <div className="footer-basic">
    <footer>
      <ul className="list-inline">
        <li className="list-inline-item"><a href="#home"><i className="fa fa-home" aria-hidden="true"></i> Home</a></li>
        <li className="list-inline-item"><a href="#about"><i className="fa-solid fa-circle-info" aria-hidden="true"></i> Games</a></li>
        <li className="list-inline-item"><a href="#games"><i className="fa fa-calculator" aria-hidden="true"></i> About</a></li>
        <li className="list-inline-item"><a href="#contact"><i className="fa fa-users" aria-hidden="true"></i> Contact</a></li>
      </ul>
      <p className="copyright">TeleGames &copy; 2024</p>
    </footer>
  </div>
);

export default Footer;
