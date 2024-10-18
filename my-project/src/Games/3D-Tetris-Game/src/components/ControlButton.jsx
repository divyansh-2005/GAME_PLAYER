/* eslint-disable react/prop-types */
import React from "react";
import { useState } from "react";

/**
 * ControlButton component that applies custom styles and shadows.
 */
const ControlButton = ({
  onClick,
  children,
  bgColor,
  shadowColor,
  style,
}) => {
  const [isActive, setIsActive] = useState(false);

  // Convert hex color to rgb.
  const rgbBgColor =
    bgColor
      .match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
      ?.slice(1)
      .map((v) => parseInt(v, 16))
      .join(",") || bgColor;

  const defaultStyle = {
    backgroundColor: bgColor,
    boxShadow: `6px 0px 0px ${shadowColor}, 10px 0px 20px rgba(${rgbBgColor}, 0.3)`,
  };

  const activeStyle = {
    boxShadow: `2px 0px 0px ${shadowColor}, 5px 0px 10px rgba(${rgbBgColor}, 0.3)`,
  };

  return (
    <button
      className="button-3d"
      onClick={onClick}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onMouseLeave={() => setIsActive(false)}
      onKeyDown={(event) => {
        if (event.key === " ") event.preventDefault();
      }}
      style={{ ...defaultStyle, ...(isActive ? activeStyle : {}), ...style }}
    >
      {children}
    </button>
  );
};

export default ControlButton;
