import React, { useRef, useEffect, useState } from "react";
import "./Pacman.css"; // Import your CSS file for styling
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Canvas from "../../Components/Canvas"; // Import your Canvas component
import Back from "../../Components/Back";

const Pacman = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [pacman, setPacman] = useState({ x: 50, y: 50 });
  const [ghosts, setGhosts] = useState([]);
  const [pellets, setPellets] = useState([]);
  const [gameRunning, setGameRunning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameRunning && !gameOver) {
        spawnPellet();
        moveGhosts();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [gameRunning, gameOver]);

  const spawnPellet = () => {
    const newPellet = {
      id: Date.now(),
      x: Math.random() * 90,
      y: Math.random() * 90,
    };
    setPellets((prevPellets) => [...prevPellets, newPellet]);
  };

  const moveGhosts = () => {
    // Logic for ghost movement can be added here
  };

  const movePacman = (direction) => {
    if (gameOver || !gameRunning) return;

    setPacman((prevPacman) => {
      let newX = prevPacman.x;
      let newY = prevPacman.y;

      switch (direction) {
        case "up":
          newY = Math.max(prevPacman.y - 5, 0);
          break;
        case "down":
          newY = Math.min(prevPacman.y + 5, 100);
          break;
        case "left":
          newX = Math.max(prevPacman.x - 5, 0);
          break;
        case "right":
          newX = Math.min(prevPacman.x + 5, 100);
          break;
        default:
          break;
      }

      return { x: newX, y: newY };
    });
  };

  const checkCollisions = () => {
    // Check for pellet collisions
    pellets.forEach((pellet) => {
      if (
        Math.abs(pacman.x - pellet.x) < 5 &&
        Math.abs(pacman.y - pellet.y) < 5
      ) {
        setScore((prevScore) => prevScore + 1);
        setPellets((prevPellets) =>
          prevPellets.filter((p) => p.id !== pellet.id)
        );
      }
    });

    // Check for ghost collisions
    ghosts.forEach((ghost) => {
      if (
        Math.abs(pacman.x - ghost.x) < 5 &&
        Math.abs(pacman.y - ghost.y) < 5
      ) {
        setGameOver(true);
      }
    });
  };

  const draw = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "yellow"; // Pac-Man color
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, 10, 0.2 * Math.PI, 1.8 * Math.PI); // Draw Pac-Man
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fill();

    // Draw pellets
    pellets.forEach((pellet) => {
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(pellet.x, pellet.y, 5, 0, 2 * Math.PI); // Draw pellets
      ctx.fill();
    });

    // Draw ghosts
    ghosts.forEach((ghost) => {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(ghost.x, ghost.y, 10, 0, 2 * Math.PI); // Draw ghosts
      ctx.fill();
    });
  };

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameRunning) {
        checkCollisions();
        draw(canvasRef.current.getContext("2d"));
      }
    }, 100);

    return () => clearInterval(gameLoop);
  }, [pacman, pellets, ghosts, gameRunning]);

  const toggleGame = () => {
    if (gameRunning) {
      setGameRunning(false);
      setGameOver(true); // End the game
    } else {
      setGameRunning(true);
      setPacman({ x: 50, y: 50 });
      setPellets([]);
      setScore(0);
      setGameOver(false);
    }
  };

  return (
    <>
      <Header />
      <Back />
      {gameOver && <div className="game-over">GAME OVER</div>}{" "}
      {/* Game Over Message */}
      <div className="pacman-container">
        <div className="game-area">
          <Canvas ref={canvasRef} width={500} height={320} />
        </div>
      </div>
      <div className="score">Score: {score}</div>
      <button className="button" onClick={toggleGame}>
        {gameRunning ? "Stop Game" : "Start Game"}
      </button>
      <Footer />
    </>
  );
};

export default Pacman;
