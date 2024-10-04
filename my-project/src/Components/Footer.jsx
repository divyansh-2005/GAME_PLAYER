import React from 'react';
import {Link} from 'react-router-dom';

const Footer = () => (
  <div className="footer-basic">
    <footer>
      <ul className="list-inline">
        <li className="list-inline-item"><Link to={'/'}><i className="fa fa-home" aria-hidden="true"></i> Home</Link></li>
        <li className="list-inline-item"><Link to={'/'}><i className="fa-solid fa-circle-info" aria-hidden="true"></i> Games</Link></li>
        <li className="list-inline-item"><Link to={'/'}><i className="fa fa-calculator" aria-hidden="true"></i> About</Link></li>
        <li className="list-inline-item"><Link to={'/'}><i className="fa fa-users" aria-hidden="true"></i> Contact</Link></li>
      </ul>
      <p className="copyright">TeleGames &copy; 2024</p>
    </footer>
  </div>
);

export default Footer;
