/** @format */

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./Style.css"; // Import your CSS file for styling
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Back from "../../Components/Back";

const SnakeGame = () => {
  const [inputDir, setInputDir] = useState({ x: 0, y: 0 });
  const [speed] = useState(10);
  const [score, setScore] = useState(0);
  const [hiscoreval, setHiscoreval] = useState(0);
  const [snakeArr, setSnakeArr] = useState([{ x: 13, y: 15 }]);
  const [food, setFood] = useState({ x: 6, y: 7 });
  const [gameOverFlag, setGameOverFlag] = useState(false);

  const foodSound = new Audio("./assets/food.mp3");
  const gameOverSound = new Audio("./assets/gameover.mp3");
  const moveSound = new Audio("./assets/move.mp3");
  const musicSound = new Audio("./assets/music.mp3");

  const showInstructions = () => {
    Swal.fire({
      title: "Instructions",
      html: "Use the arrow keys to move the snake and eat the square boxes.",
      icon: "info",
      confirmButtonText: "Got it!",
      customClass: {
        confirmButton: "sweet-alert-button",
      },
    });
  };

  const isCollide = () => {
    for (let index = 1; index < snakeArr.length; index++) {
      if (
        snakeArr[index].x === snakeArr[0].x &&
        snakeArr[index].y === snakeArr[0].y
      ) {
        return true;
      }
    }
    if (
      snakeArr[0].x >= 18 ||
      snakeArr[0].x <= 0 ||
      snakeArr[0].y >= 18 ||
      snakeArr[0].y <= 0
    ) {
      return true;
    }
    return false;
  };

  const gameOver = () => {
    gameOverSound.play();
    musicSound.pause();
    setInputDir({ x: 0, y: 0 });
    setGameOverFlag(true);
    Swal.fire({
      title: "Game Over",
      text: "Press the button to play again",
      icon: "error",
      confirmButtonText: "Restart",
      customClass: {
        confirmButton: "sweet-alert-button",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        resetGame();
      }
    });
    musicSound.play();
  };

  const resetGame = () => {
    setGameOverFlag(false);
    setSnakeArr([{ x: 13, y: 15 }]);
    setFood({ x: 6, y: 7 });
    setScore(0);
    setInputDir({ x: 0, y: 0 });
  };

  const gameEngine = () => {
    if (gameOverFlag) return;

    if (isCollide()) {
      gameOver();
      return;
    }

    if (snakeArr[0].x === food.x && snakeArr[0].y === food.y) {
      foodSound.play();
      setScore((prevScore) => prevScore + 1);
      if (score + 1 > hiscoreval) {
        setHiscoreval(score + 1);
        localStorage.setItem("hiscore", JSON.stringify(score + 1));
      }
      const newSnakeArr = [
        { x: snakeArr[0].x + inputDir.x, y: snakeArr[0].y + inputDir.y },
        ...snakeArr,
      ];
      setSnakeArr(newSnakeArr);
      let a = 2;
      let b = 16;
      setFood({
        x: Math.round(a + (b - a) * Math.random()),
        y: Math.round(a + (b - a) * Math.random()),
      });
    }

    let snakeArrCopy = [...snakeArr];
    for (let i = snakeArrCopy.length - 2; i >= 0; i--) {
      snakeArrCopy[i + 1] = { ...snakeArrCopy[i] };
    }
    snakeArrCopy[0].x += inputDir.x;
    snakeArrCopy[0].y += inputDir.y;
    setSnakeArr(snakeArrCopy);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      gameEngine();
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [snakeArr, inputDir, speed, gameOverFlag]);

  useEffect(() => {
    const hiscore = localStorage.getItem("hiscore");
    if (hiscore === null) {
      setHiscoreval(0);
      localStorage.setItem("hiscore", JSON.stringify(0));
    } else {
      setHiscoreval(JSON.parse(hiscore));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      musicSound.play();
      moveSound.play();
      switch (e.key) {
        case "ArrowUp":
          setInputDir({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          setInputDir({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          setInputDir({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          setInputDir({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Header />
      <Back />
      <div className="snake-game flex flex-col items-center justify-center md:flex-row md:justify-between gap-6 mb-5 w-5/6 mx-auto">
        <div className="stats-section flex flex-col items-center md:w-1/3">
          <h1 className="text-3xl sm:text-4xl md:text-6xl text-center text-white font-bold mb-4 md:mb-6">
            Snake Game
          </h1>
          <button
            onClick={showInstructions}
            className="instructions bg-orange-400 text-white p-4 rounded-lg hover:bg-orange-700 transition-all mb-6"
          >
            Instructions
          </button>
          <div
            id="scoreBox"
            className="bg-white text-black p-4 rounded-lg text-xl font-semibold mb-4"
          >
            Score: {score}
          </div>
          <div
            id="HiScore"
            className="bg-white text-black p-4 rounded-lg text-xl font-semibold"
          >
            HighScore: {hiscoreval}
          </div>
        </div>
        <div className="game-section md:w-2/3 flex justify-center">
          <div
            id="board"
            className="bg-orange-600 border-2 border-black grid grid-cols-18 grid-rows-18 w-[75vmin] h-[75vmin] md:w-[60vmin] md:h-[60vmin]"
          >
            {snakeArr.map((snakePart, index) => (
              <div
                key={index}
                className={index === 0 ? "head" : "snake"}
                style={{
                  gridRowStart: snakePart.y,
                  gridColumnStart: snakePart.x,
                }}
              />
            ))}
            <div
              className="food"
              style={{ gridRowStart: food.y, gridColumnStart: food.x }}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SnakeGame;
