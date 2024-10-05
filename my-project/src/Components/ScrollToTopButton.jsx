import { useEffect, useState } from 'react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false); // State to control visibility

  useEffect(() => {
    const handleScroll = () => {
      const pos = window.pageYOffset;
      setIsVisible(pos > 200); // Set visibility based on scroll position
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
        cursor: 'pointer',
        zIndex: 1000,
      }}
    >
    </div>
  );
};

export default ScrollToTopButton;
