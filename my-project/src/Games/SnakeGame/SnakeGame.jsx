import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './Style.css'; // Import your CSS file for styling

const SnakeGame = () => {
  const [inputDir, setInputDir] = useState({ x: 0, y: 0 });
  const [speed] = useState(10);
  const [score, setScore] = useState(0);
  const [hiscoreval, setHiscoreval] = useState(0);
  const [snakeArr, setSnakeArr] = useState([{ x: 13, y: 15 }]);
  const [food, setFood] = useState({ x: 6, y: 7 });
  const [gameOverFlag, setGameOverFlag] = useState(false); // Flag to control game over state

  // Audio files
  const foodSound = new Audio('./assets/food.mp3');
  const gameOverSound = new Audio('./assets/gameover.mp3');
  const moveSound = new Audio('./assets/move.mp3');
  const musicSound = new Audio('./assets/music.mp3');

  // Function to display instructions using SweetAlert2
  const showInstructions = () => {
    Swal.fire({
      title: 'Instructions',
      html: 'Use the arrow keys to move the snake and eat the square boxes.',
      icon: 'info',
      confirmButtonText: 'Got it!',
      customClass: {
        confirmButton: 'sweet-alert-button',
      },
    });
  };

  // Function to check if snake collides with itself or walls
  const isCollide = () => {
    for (let index = 1; index < snakeArr.length; index++) {
      if (snakeArr[index].x === snakeArr[0].x && snakeArr[index].y === snakeArr[0].y) {
        return true;
      }
    }
    if (snakeArr[0].x >= 18 || snakeArr[0].x <= 0 || snakeArr[0].y >= 18 || snakeArr[0].y <= 0) {
      return true;
    }
    return false;
  };

  // Function to handle game over conditions
  const gameOver = () => {
    gameOverSound.play();
    musicSound.pause();
    setInputDir({ x: 0, y: 0 });
    setGameOverFlag(true); // Set game over flag
    Swal.fire({
      title: 'Game Over',
      text: 'Press the button to play again',
      icon: 'error',
      confirmButtonText: 'Restart',
      customClass: {
        confirmButton: 'sweet-alert-button',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        resetGame(); // Reset game on restart
      }
    });
    musicSound.play();
  };

  // Function to reset the game state
  const resetGame = () => {
    setGameOverFlag(false); // Reset game over flag
    setSnakeArr([{ x: 13, y: 15 }]);
    setFood({ x: 6, y: 7 });
    setScore(0);
    setInputDir({ x: 0, y: 0 });
  };

  // Function to handle game logic
  const gameEngine = () => {
    if (gameOverFlag) return; // Exit game engine if game over

    // Check for collision
    if (isCollide()) {
      gameOver();
      return;
    }

    // Check if food is eaten
    if (snakeArr[0].x === food.x && snakeArr[0].y === food.y) {
      foodSound.play();
      setScore((prevScore) => prevScore + 1);
      if (score + 1 > hiscoreval) {
        setHiscoreval(score + 1);
        localStorage.setItem('hiscore', JSON.stringify(score + 1));
      }
      const newSnakeArr = [{ x: snakeArr[0].x + inputDir.x, y: snakeArr[0].y + inputDir.y }, ...snakeArr];
      setSnakeArr(newSnakeArr);
      let a = 2;
      let b = 16;
      setFood({ x: Math.round(a + (b - a) * Math.random()), y: Math.round(a + (b - a) * Math.random()) });
    }

    // Move the snake
    let snakeArrCopy = [...snakeArr];
    for (let i = snakeArrCopy.length - 2; i >= 0; i--) {
      snakeArrCopy[i + 1] = { ...snakeArrCopy[i] };
    }
    snakeArrCopy[0].x += inputDir.x;
    snakeArrCopy[0].y += inputDir.y;
    setSnakeArr(snakeArrCopy);
  };

  // Main game loop
  useEffect(() => {
    const interval = setInterval(() => {
      gameEngine();
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [snakeArr, inputDir, speed, gameOverFlag, gameEngine]);

  // Initialize high score from localStorage on component mount
  useEffect(() => {
    const hiscore = localStorage.getItem('hiscore');
    if (hiscore === null) {
      setHiscoreval(0);
      localStorage.setItem('hiscore', JSON.stringify(0));
    } else {
      setHiscoreval(JSON.parse(hiscore));
    }
  }, []);

  // Event listener for keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      musicSound.play();
      moveSound.play();
      switch (e.key) {
        case 'ArrowUp':
          setInputDir({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          setInputDir({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          setInputDir({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          setInputDir({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveSound, musicSound]);

  return (
    <div className="snake-game">
      <div className="body">
        <button onClick={showInstructions} className="instructions">
          Instructions
        </button>
        <div id="scoreBox">Score: {score}</div>
        <div id="HiScore">HighScore: {hiscoreval}</div>
        <div id="board">
          {snakeArr.map((snakePart, index) => (
            <div
              key={index}
              className={index === 0 ? 'head' : 'snake'}
              style={{ gridRowStart: snakePart.y, gridColumnStart: snakePart.x }}
            />
          ))}
          <div className="food" style={{ gridRowStart: food.y, gridColumnStart: food.x }} />
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
