import React, { useEffect, useRef } from 'react';
import LoaderWrapper from './LoaderWrapper';
import Header from './Header';
import HeroSection from './HeroSection';
import GameSection from './GameSection';
import ScrollToTopButton from './ScrollToTopButton';
import Footer from './Footer';
import './style.css';

const calcScrollValue = () => {
  const scrollProgress = document.getElementById('progress');
  const pos = document.documentElement.scrollTop;
  const calcHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrollValue = Math.round((pos * 100) / calcHeight);

  if (pos > 100) {
    scrollProgress.style.display = 'grid';
  } else {
    scrollProgress.style.display = 'none';
  }

  scrollProgress.addEventListener('click', () => {
    document.documentElement.scrollTop = 0;
  });

  scrollProgress.style.background = `conic-gradient(#03cc65 ${scrollValue}%, #d7d7d7 ${scrollValue}%)`;
};

const HomePage = () => {
  const gameSectionRef = useRef(null);

  const scrollToGameSection = () => {
    gameSectionRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      document.body.classList.add('loaded');
    }, 500);

    window.addEventListener('scroll', calcScrollValue);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', calcScrollValue);
    };
  }, []);

  return (
    <>  
      <LoaderWrapper />
      <Header />
      <HeroSection scrollToGameSection={scrollToGameSection} />
      <GameSection ref={gameSectionRef} />
      <ScrollToTopButton />
      <Footer />
    </>
  );
};

export default HomePage;
