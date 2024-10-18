import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons'
import './Back.css'; // Make sure to add your CSS here


function Back() {
  return (
    <Link to={"/"} className="back-icon">
      <FontAwesomeIcon icon={faArrowLeftLong} />
    </Link>
  );
}


export default Back;
