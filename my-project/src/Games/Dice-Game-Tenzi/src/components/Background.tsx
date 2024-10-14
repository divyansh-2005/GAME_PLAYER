import React from "react";

const Background: React.FC = () => {
  return (
    <svg
      id="spinning-rays"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <path d="M50,50l100,-26.7949l0,53.5898z">
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="60s"
          repeatCount="indefinite"
        />
      </path>
      <path d="M50,50l100,-26.7949l0,53.5898z">
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="60 50 50"
          to="420 50 50"
          dur="60s"
          repeatCount="indefinite"
        />
      </path>
      <path d="M50,50l100,-26.7949l0,53.5898z">
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="120 50 50"
          to="480 50 50"
          dur="60s"
          repeatCount="indefinite"
        />
      </path>
      <path d="M50,50l100,-26.7949l0,53.5898z">
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="180 50 50"
          to="540 50 50"
          dur="60s"
          repeatCount="indefinite"
        />
      </path>
      <path d="M50,50l100,-26.7949l0,53.5898z">
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="240 50 50"
          to="600 50 50"
          dur="60s"
          repeatCount="indefinite"
        />
      </path>
      <path d="M50,50l100,-26.7949l0,53.5898z">
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="300 50 50"
          to="660 50 50"
          dur="60s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

export default Background;