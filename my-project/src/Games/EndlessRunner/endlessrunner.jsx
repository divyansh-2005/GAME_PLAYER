import React, { useEffect, useState } from "react";
import { gsap } from "gsap";
import "./style.css"; // Ensure you have the CSS file

// Import images directly
import sky from "./images/sky.jpg";
import sky2 from "./images/sky2.jpg";
import chickenImage from "./images/chicken.png";
import obstacleImage from "./images/images.jpeg";
import groundImage from "./images/ground.jpg";

const EndlessRunner = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.from("h1", {
      y: -50,
      opacity: 0,
      delay: 0.4,
      duration: 0.8,
    });
    tl.from("p", {
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
    setCounter(counter + 1);
  };

  useEffect(() => {
    const lose = setInterval(() => {
      const chicken = document.getElementById("chicken");
      const obstacle = document.getElementById("obstacle");
      const chickenTop = parseInt(
        window.getComputedStyle(chicken).getPropertyValue("top")
      );
      const blockLeft = parseInt(
        window.getComputedStyle(obstacle).getPropertyValue("left")
      );
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
    <div className="container" onClick={jump}>
      <h1>Endless Runner</h1>
      <div id="game">
        <img className="bg-img" src={sky2} alt="background" />
        <img className="bg-img-2" src={sky} alt="background2" />
        <div id="chicken">
          <img
            src={chickenImage}
            width="60px"
            height="60px"
            alt="chicken"
          />
        </div>
        <div id="obstacle">
          <img
            src={obstacleImage}
            width="50px"
            height="50px"
            alt="obstacle"
          />
        </div>
      </div>
      <div id="ground">
        <img
          src={groundImage}
          width="700px"
          height="60px"
          alt="ground"
        />
      </div>
      <p>© 2024 Priya Ashu.</p>
    </div>
  );
};

export default EndlessRunner;
