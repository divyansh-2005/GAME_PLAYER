import React, { useState, useEffect } from 'react';
import './App.css';

const fruitsArray = ['🍎', '🍌', '🍉', '🍊', '🍍'];

const Fruit = ({ x, y, onSlice, id, emoji }) => {
  return (
    <div
      className="fruit"
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        fontSize: '40px',
        cursor: 'pointer',
      }}
      onClick={() => onSlice(id)}
    >
      {emoji}
    </div>
  );
};

const GameArea = ({ onGameOver, isPaused }) => {
  const [fruits, setFruits] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        const newFruit = {
          id: Date.now(),
          x: Math.random() * (window.innerWidth - 50),
          y: 0,
          emoji: fruitsArray[Math.floor(Math.random() * fruitsArray.length)],
        };
        setFruits((prevFruits) => [...prevFruits, newFruit]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isPaused]);

  useEffect(() => {
    if (!isPaused) {
      const fallInterval = setInterval(() => {
        setFruits((prevFruits) =>
          prevFruits.map((fruit) => ({
            ...fruit,
            y: fruit.y + 5,
          }))
        );
      }, 100);

      return () => clearInterval(fallInterval);
    }
  }, [isPaused]);

  useEffect(() => {
    if (timeLeft > 0 && !isPaused) {
      const timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      onGameOver(score);
    }
  }, [timeLeft, isPaused, onGameOver, score]);

  const handleSlice = (id) => {
    setFruits((prevFruits) => prevFruits.filter((fruit) => fruit.id !== id));
    setScore((prevScore) => prevScore + 10);
  };

  return (
    <div className="game-area" style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {fruits.map((fruit) => (
        <Fruit key={fruit.id} id={fruit.id} x={fruit.x} y={fruit.y} emoji={fruit.emoji} onSlice={handleSlice} />
      ))}
      <div className="score" style={{ position: 'absolute', top: 0, right: 0, padding: '10px', color: 'white' }}>
        Score: {score}
      </div>
      <div className="timer" style={{ position: 'absolute', top: 0, left: 0, padding: '10px', color: 'white' }}>
        Time Left: {timeLeft}s
      </div>
    </div>
  );
};

const App = () => {
  const [gameState, setGameState] = useState('start');
  const [finalScore, setFinalScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const startGame = () => {
    setGameState('playing');
    setIsPaused(false);
  };

  const endGame = (score) => {
    setFinalScore(score);
    setGameState('gameover');
  };

  const togglePause = () => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
  };

  return (
    <div className="App">
      {gameState === 'start' && (
        <div className="start-screen" style={{ textAlign: 'center', marginTop: '20%' }}>
          <h1 className="welcome-text">Welcome to Fruit Ninja 🍉🍍</h1>
          <button onClick={startGame} style={{ padding: '10px 20px', fontSize: '18px' }}>
            Start Game
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <>
          <GameArea onGameOver={endGame} isPaused={isPaused} />
          <button
            onClick={togglePause}
            className="pause-button"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </>
      )}

      {gameState === 'gameover' && (
        <div className="end-screen" style={{ textAlign: 'center', marginTop: '20%' }}>
          <h1>Game Over!</h1>
          <p>Your Score: {finalScore}</p>
          <button onClick={() => setGameState('start')} style={{ padding: '10px 20px', fontSize: '18px' }}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
