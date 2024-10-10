import React, { useEffect, useState } from "react";
import { gsap } from "gsap";


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
    <div
      style={{
        margin: 0,
        padding: 0,
        background: `url(./images/one-piece-desktop-kids-running-b5b3kgp79e5rebgg.jpg)`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "black",
      }}
      onClick={jump}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#fff",
            fontSize: "50px",
            fontFamily: "'Arial', sans-serif",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
            background: "linear-gradient(45deg, #b7d605, #f09d03)",
            padding: "10px 20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            marginBottom: "20px",
          }}
        >
          Endless Runner
        </h1>

        <div
          id="game"
          style={{
            width: "700px",
            height: "250px",
            position: "relative",
            backgroundColor: "#111",
          }}
        >
          <img
            className="bg-img"
            src={sky2}
            alt="background"
            style={{
              position: "absolute",
              width: "350px",
              height: "250px",
              opacity: 0.6,
            }}
          />
          <img
            className="bg-img-2"
            src={sky}
            alt="background2"
            style={{
              position: "absolute",
              left: "350px",
              width: "350px",
              height: "250px",
              opacity: 0.6,
            }}
          />

          <div
            id="chicken"
            style={{
              width: "105px",
              height: "105px",
              borderRadius: "50%",
              position: "absolute",
              top: "190px",
              left: "100px",
            }}
          >
            <img src={chickenImage} alt="chicken" />
          </div>

          <div
            id="obstacle"
            style={{
              width: "50px",
              height: "50px",
              background: "none",
              position: "absolute",
              top: "150px",
              left: "100%",
              animation: "block 1.3s infinite linear",
            }}
          >
            <img src={obstacleImage} alt="obstacle" />
          </div>
        </div>

        <div
          id="ground"
          style={{
            width: "700px",
            height: "60px",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <img
            src={groundImage}
            className="ground"
            alt="ground"
            style={{
              backgroundSize: "cover",
              height: "60px",
              width: "700px",
              backgroundPosition: "end",
            }}
          />
        </div>

        <p
          style={{
            color: "aliceblue",
            fontSize: "larger",
            marginTop: "100px",
          }}
        >
          © 2024 Priya Ashu.
        </p>
      </div>

      <style>{`
        .animate {
          animation: jump 0.5s linear;
        }
        
        @keyframes jump {
          0% {
            top: 150px;
          }
          30% {
            top: 100px;
          }
          70% {
            top: 100px;
          }
          100% {
            top: 150px;
          }
        }
        
        @keyframes block {
          0% {
            left: 680px;
          }
          100% {
            left: -50px;
          }
        }
      `}</style>
    </div>
  );
};

export default EndlessRunner;
