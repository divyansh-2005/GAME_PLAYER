import React, { useEffect, useState } from 'react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false); // State to control visibility

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.pageYOffset > 200); // Set visibility based on scroll position
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      id="progress"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed',
        bottom: '50px',
        right: '50px',
        display: isVisible ? 'flex' : 'none', // Use state to control visibility
        backgroundColor: '#000',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        cursor: 'pointer',
        zIndex: 1000,
        alignItems: 'center', // Vertically center the triangle
        justifyContent: 'center', // Horizontally center the triangle
      }}
    >
      {/* Upward-facing black triangle */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: '15px solid black', // Triangle color is black
        }}
      ></div>
    </div>
  );
};

export default ScrollToTopButton;
