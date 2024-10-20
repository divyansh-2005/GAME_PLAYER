import React, { useEffect } from 'react'
import GameSection from './GameSection'
import Header from './Header'
import Footer from './Footer'
import ScrollToTopButton from './ScrollToTopButton'



function Games() {
  
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
    <Header/>
    <GameSection/>
    <ScrollToTopButton />
    <Footer/>
    </>
  )
}

export default Games
