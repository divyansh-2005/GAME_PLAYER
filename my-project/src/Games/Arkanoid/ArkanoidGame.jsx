/** @format */

import React, { useRef, useEffect, useState } from "react";
import "./ArkanoidGame.css"; // Import your CSS file for styling
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Canvas from "../../Components/Canvas"; // Import your Canvas component
import Back from "../../Components/Back";

const ArkanoidGame = () => {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(true); // Start the game immediately
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [brickRowCount] = useState(5);
  const [brickColumnCount] = useState(9);
  const brickWidth = 75;
  const brickHeight = 20;
  const brickPadding = 10;
  const brickOffsetTop = 30;
  const brickOffsetLeft = 30;

  const ballRadius = 10;
  let x, y, dx, dy, paddleX;

  const bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }

  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const ctx = canvasRef.current.getContext("2d");
      initializeGame(ctx);
      draw(ctx);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [gameStarted, gameOver]);

  const initializeGame = () => {
    if (canvasRef.current) {
      x = canvasRef.current.width / 2;
      y = canvasRef.current.height - 30;
      dx = 2;
      dy = -2;
      paddleX = (canvasRef.current.width - 75) / 2;
      window.addEventListener("mousemove", handleMouseMove);
    }
  };

  const handleMouseMove = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    paddleX = Math.min(
      Math.max(mouseX - 75 / 2, 0),
      canvasRef.current.width - 75
    ); // Center the paddle on the mouse
  };

  const drawBall = (ctx) => {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  };

  const drawPaddle = (ctx) => {
    ctx.beginPath();
    ctx.rect(paddleX, canvasRef.current.height - 10, 75, 10);

    // Create gradient for paddle
    const paddleGradient = ctx.createLinearGradient(
      paddleX,
      canvasRef.current.height - 10,
      paddleX + 75,
      canvasRef.current.height - 10
    );
    paddleGradient.addColorStop(0, "#0095DD");
    paddleGradient.addColorStop(1, "#00aaff");

    ctx.fillStyle = paddleGradient;
    ctx.fill();
    ctx.closePath();
  };

  const drawBricks = (ctx) => {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status === 1) {
          const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
          const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;

          // Create gradient for brick
          const gradient = ctx.createLinearGradient(
            brickX,
            brickY,
            brickX,
            brickY + brickHeight
          );
          gradient.addColorStop(0, "#ffcc00");
          gradient.addColorStop(1, "#ff9900");

          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  };

  const collisionDetection = () => {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const b = bricks[c][r];
        if (b.status === 1) {
          if (
            x > b.x &&
            x < b.x + brickWidth &&
            y > b.y &&
            y < b.y + brickHeight
          ) {
            dy = -dy;
            b.status = 0;
            setScore((prevScore) => prevScore + 1);
            if (score + 1 === brickRowCount * brickColumnCount) {
              alert("YOU WIN, CONGRATULATIONS!");
              document.location.reload();
            }
          }
        }
      }
    }
  };

  const draw = () => {
    if (!canvasRef.current) {
      return; // Exit if the canvas reference is not set
    }
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drawBricks(ctx);
    drawBall(ctx);
    drawPaddle(ctx);
    collisionDetection();

    if (x + dx > canvasRef.current.width - ballRadius || x + dx < ballRadius) {
      dx = -dx;
    }
    if (y + dy < ballRadius) {
      dy = -dy;
    } else if (y + dy > canvasRef.current.height - ballRadius) {
      if (x > paddleX && x < paddleX + 75) {
        dy = -dy;
      } else {
        setLives((prevLives) => {
          if (prevLives === 1) {
            setGameOver(true);
            alert("GAME OVER");
            document.location.reload();
            return 0; // Ensure lives are set to 0
          }
          return prevLives - 1;
        });
        initializeGame(); // Reset game state
      }
    }

    x += dx;
    y += dy;

    requestAnimationFrame(draw);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    draw(); // Call draw only after setting up the game
  };

  return (
    <>
      <Header />
      <Back />
      <h1 className="text-3xl sm:text-4xl md:text-6xl text-center text-white font-bold mb-4 md:mb-6 neon-text">
        Arkanoid
      </h1>
      <div className="arkanoid-container bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 p-6 rounded-lg shadow-lg max-w-screen-md mx-auto">
        <div className="game-area relative bg-blue-900 rounded-lg shadow-md overflow-hidden">
          <Canvas
            ref={canvasRef}
            width={500}
            height={320}
            className="rounded-lg border-4 border-blue-800 w-5/6 mx-auto"
          />
          <div className="absolute top-2 left-4 text-white text-xl font-bold score">
            Score: {score}
          </div>
          <div className="absolute top-2 right-4 text-white text-xl font-bold lives">
            Lives: {lives}
          </div>
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center text-red-500 text-3xl font-extrabold game-over neon-glow">
              Game Over
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ArkanoidGame;
