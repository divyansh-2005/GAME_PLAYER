import React, { useRef, useEffect, useState } from "react";
import "./DuckHunt.css"; // Import your CSS file for styling
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Canvas from "../../Components/Canvas"; // Import your Canvas component
import Back from '../../Components/Back';

const DuckHunt = () => {
    const canvasRef = useRef(null);
    const [ducks, setDucks] = useState([]);
    const [score, setScore] = useState(0);
    const [misses, setMisses] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameRunning, setGameRunning] = useState(false);

    useEffect(() => {
      const interval = setInterval(() => {
        if (gameRunning && !gameOver) {
          spawnDuck();
        }
      }, 2000);

      return () => clearInterval(interval);
    }, [gameRunning, gameOver]);

    const spawnDuck = () => {
      const newDuck = {
        id: Date.now(),
        x: Math.random() * 90,
        y: Math.random() * 90,
        clicked: false,
      };
      setDucks((prevDucks) => [...prevDucks, newDuck]);

      setTimeout(() => {
        setDucks((prevDucks) => prevDucks.filter((duck) => duck.id !== newDuck.id));
        if (!newDuck.clicked) {
          missDuck();
        }
      }, 2000);
    };

    const shootDuck = (id) => {
        if (gameOver || !gameRunning) return;
        setDucks((prevDucks) => {
          const duck = prevDucks.find((duck) => duck.id === id);
          if (duck) {
            duck.clicked = true;
            setScore((prevScore) => prevScore + 1);
          }
          return prevDucks.filter((duck) => duck.id !== id);
        });
    };

    const missDuck = () => {
      if (gameOver || !gameRunning) return;
      setMisses((prevMisses) => {
        const newMisses = prevMisses + 1;
        if (newMisses >= 3) {
          setGameOver(true);
          setGameRunning(false); // Stop the game
        }
        return newMisses;
      });
    };

    const drawDucks = (ctx) => {
      ducks.forEach((duck) => {
        ctx.fillText("🦆", duck.x + "%", duck.y + "%");
      });
    };

    const draw = () => {
      if (!canvasRef.current) {
        return;
      }
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.font = "40px serif";
      ctx.textBaseline = "middle";
      drawDucks(ctx);
    };

    useEffect(() => {
      const gameLoop = setInterval(() => {
        if (gameRunning) {
          draw();
        }
      }, 100);

      return () => clearInterval(gameLoop);
    }, [ducks, gameRunning]);

    const toggleGame = () => {
      if (gameRunning) {
        setGameRunning(false);
        setGameOver(true); // End the game
      } else {
        setGameRunning(true);
        setDucks([]);
        setScore(0);
        setMisses(0);
        setGameOver(false);
      }
    };

    return (
      <>
        <Header />
        <Back />
        {gameOver && <div className="game-over">GAME OVER</div>} {/* Game Over Message */}
        <div className="duck-hunt-container">
            <div className="game-area">
            <Canvas ref={canvasRef} width={500} height={320} />
            {ducks.map((duck) => (
                <div
                key={duck.id}
                className="duck"
                style={{ left: `${duck.x}%`, top: `${duck.y}%` }}
                onClick={() => shootDuck(duck.id)}
                >
                🦆
                </div>
            ))}
            </div>
        </div>
        <div className="score">Score: {score}</div>
        <div className="misses">Misses: {misses}</div>
        <button className="button" onClick={toggleGame}>
            {gameRunning ? "Stop Game" : "Start Game"}
        </button>
        <Footer />
      </>
    );
};

export default DuckHunt;
