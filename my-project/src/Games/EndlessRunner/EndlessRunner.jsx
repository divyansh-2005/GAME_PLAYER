import React, { useEffect, useState } from "react";
import { gsap } from "gsap";

import sky from "./images/sky.jpg";
import sky2 from "./images/sky2.jpg";
import chickenImage from "./images/chicken.png";
import obstacleImage from "./images/images.jpeg";
import groundImage from "./images/ground.jpg";

const EndlessRunner = () => {
  const [counter, setCounter] = useState(0);
  const [timer, setTimer] = useState(30); // Set initial timer value (in seconds)
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [obstacleVisible, setObstacleVisible] = useState(false); // State to control obstacle visibility

  useEffect(() => {
    const tl = gsap.timeline();
    tl.from("p", {
      y: 60,
      opacity: 0,
      duration: 0.5,
      stagger: 0.5,
    });
  }, []);

  const jump = () => {
    if (!isGameRunning) return; // Prevent jumping if the game hasn't started

    const chicken = document.getElementById("chicken");
    if (!chicken.classList.contains("animate")) {
      chicken.classList.add("animate");
      setCounter((prevCounter) => prevCounter + 1); // Increment score on a successful jump
    }
    setTimeout(() => {
      chicken.classList.remove("animate");
    }, 500);
  };

  useEffect(() => {
    const lose = setInterval(() => {
      if (!isGameRunning) return; // Prevent collision detection if the game isn't running

      const chicken = document.getElementById("chicken");
      const obstacle = document.getElementById("obstacle");
      const chickenTop = parseInt(
        window.getComputedStyle(chicken).getPropertyValue("top")
      );
      const blockLeft = parseInt(
        window.getComputedStyle(obstacle).getPropertyValue("left")
      );
      // Collision detection
      if (blockLeft < 20 && blockLeft > 0 && chickenTop >= 130) {
        obstacle.style.animation = "none";
        obstacle.style.display = "none";
        setIsGameRunning(false);
        setObstacleVisible(false); // Hide obstacle when the game ends
        alert(`Your SCORE: ${counter}`); // Show score alert when the game ends
      }
    }, 10);
    return () => clearInterval(lose);
  }, [counter, isGameRunning]);

  useEffect(() => {
    let interval;
    if (isGameRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
        setObstacleVisible(true); // Show obstacle when the game starts
      }, 1000);
    } else if (timer === 0 && isGameRunning) {
      alert(`Time's up! Your SCORE: ${counter}`);
      setIsGameRunning(false);
      setCounter(0);
      setObstacleVisible(false); // Hide obstacle when the game ends
    }
    return () => clearInterval(interval);
  }, [isGameRunning, timer]);

  const startGame = () => {
    setIsGameRunning(true);
    setCounter(0); // Reset score when starting the game
    setTimer(30); // Reset timer to 30 seconds when starting the game
    setObstacleVisible(true); // Show obstacle when starting the game
  };

  const handleKeyPress = (event) => {
    // Start the game when the 'S' key is pressed
    if (event.key === "s" && !isGameRunning) {
      startGame();
    } else if (isGameRunning && event.key === " ") {
      jump(); // Jump if the game is running
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isGameRunning]);

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        backgroundImage: `url(${sky})`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "black",
        position: "relative", // Added relative position for absolute elements inside
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: "50px",
            fontFamily: "'Arial', sans-serif",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
            backgroundColor: "black",
            padding: "10px 20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            marginBottom: "20px",
          }}
        >
          Endless Runner
        </h1>

        <div
          style={{
            color: "white",
            fontSize: "30px",
            marginBottom: "20px",
          }}
        >
          {isGameRunning ? `Time Left: ${timer}s` : "Press 'S' to Start"}
        </div>

        <div
          id="game"
          style={{
            width: "700px",
            height: "250px",
            position: "relative",
            backgroundColor: "#111",
            overflow: "hidden", // Prevents overflow of the obstacle
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

          {obstacleVisible && ( // Only show the obstacle if the game is running
            <div
              id="obstacle"
              style={{
                width: "50px",
                height: "50px",
                background: "none",
                position: "absolute",
                top: "200px",
                left: "100%",
                animation: "block 1.3s infinite linear",
              }}
            >
              <img src={obstacleImage} alt="obstacle" />
            </div>
          )}
        </div>

        <div
          id="ground"
          style={{
            width: "700px",
            height: "60px",
            backgroundPosition: "center",
            backgroundSize: "cover",
            
            bottom: "0",
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
