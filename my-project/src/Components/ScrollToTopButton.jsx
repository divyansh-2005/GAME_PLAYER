import React, { useEffect } from 'react';

const ScrollToTopButton = () => {
  useEffect(() => {
    const scrollToTopButton = document.getElementById('progress');
    const handleScroll = () => {
      if (window.pageYOffset > 200) {
        scrollToTopButton.style.display = 'block';
      } else {
        scrollToTopButton.style.display = 'none';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div id="progress" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <span id="progress-value" className="bi bi-arrow-up-short"></span>
    </div>
  );
};

export default ScrollToTopButton;
