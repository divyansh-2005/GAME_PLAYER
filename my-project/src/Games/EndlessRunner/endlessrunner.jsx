import React from 'react';
import { useEffect, useState } from 'react';
import './style.css'; // For additional custom animations if needed
import { gsap } from 'gsap';

const EndlessRunner = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    let timeline = gsap.timeline();
    timeline.from("h1", {
      y: -50,
      opacity: 0,
      delay: 0.4,
      duration: 0.8,
    });
    timeline.from("p", {
      y: 60,
      opacity: 0,
      duration: 0.5,
      stagger: 0.5,
    });
  }, []);

  const jump = () => {
    const chicken = document.getElementById("chicken");
    if (!chicken.classList.contains("animate")) {
      chicken.classList.add("animate");
    }
    setTimeout(() => {
      chicken.classList.remove("animate");
    }, 500);
    setCounter((prev) => prev + 1);
  };

  useEffect(() => {
    const lose = setInterval(() => {
      const chicken = document.getElementById("chicken");
      const obstacle = document.getElementById("obstacle");
      const chickenTop = parseInt(window.getComputedStyle(chicken).getPropertyValue("top"));
      const blockLeft = parseInt(window.getComputedStyle(obstacle).getPropertyValue("left"));

      if (blockLeft < 20 && blockLeft > 0 && chickenTop >= 130) {
        obstacle.style.animation = "none";
        obstacle.style.display = "none";
        alert(`SCORE: ${counter}`);
        setCounter(0);
      }
    }, 10);

    return () => clearInterval(lose);
  }, [counter]);

  return (
    <div onClick={jump} className="flex flex-col items-center justify-center h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(/images/one-piece-desktop-kids-running-b5b3kgp79e5rebgg.jpg)` }}>
      <h1 className="text-white text-4xl font-bold tracking-wider text-shadow-lg p-4 bg-gradient-to-r from-green-400 to-yellow-500 rounded-lg shadow-md">Endless Runner</h1>
      
      <div className="relative flex flex-col items-center bg-gray-900" id="container">
        <div id="game" className="relative w-[700px] h-[250px] mt-12">
          <img src="/images/sky2.jpg" alt="background1" className="absolute opacity-60 w-[350px] h-[250px]" />
          <img src="/images/sky.jpg" alt="background2" className="absolute left-[350px] opacity-60 w-[350px] h-[270px]" />
          
          <div id="chicken" className="absolute w-[60px] h-[60px] bg-red-500 left-[100px] top-[190px] animate-chicken">
            <img src="/images/png-clipart-chicken.png" alt="chicken" className="w-full h-full" />
          </div>
          
          <div id="obstacle" className="absolute w-[50px] h-[50px] bg-green-500 top-[150px] left-full animate-obstacle">
            <img src="/images/images.jpeg" alt="obstacle" className="w-full h-full" />
          </div>
        </div>
        
        <div id="ground" className="w-[700px] h-[50px] bg-brown-500 mt-4">
          <img src="/images/pngtree-game-pixel-scene.png" alt="ground" className="w-full h-full" />
        </div>
      </div>
      
      <p className="text-white text-lg mt-16">© 2024 Priya Ashu.</p>
    </div>
  );
};

export default EndlessRunner;
