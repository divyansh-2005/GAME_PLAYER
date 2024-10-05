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
    scrollProgress.style.display = 'flex'; // Show the triangle
  } else {
    scrollProgress.style.display = 'none'; // Hide the triangle
  }
    // Set the triangle color based on scroll value (white to green)
  const hue = Math.round(120 * (scrollValue / 100)); // Gradient from white (hue 0) to green (hue 120)
  scrollProgress.style.borderBottomColor = `hsl(${hue}, 100%, 50%)`; // Transition from white to green
  scrollProgress.style.pointerEvents = 'auto'; // Ensure it can be c
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
