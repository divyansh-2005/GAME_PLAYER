import React, { useState, useEffect } from "react";
import Header from "../../Components/Header";
import Back from '../../Components/Back';

const ClickSpeedTest = () => {
  const [timeLeft, setTimeLeft] = useState(10); // Timer countdown (in seconds)
  const [clickCount, setClickCount] = useState(0); // Count the player's clicks
  const [isGameActive, setIsGameActive] = useState(false); // Whether the game is active or not
  const [prompt, setPrompt] = useState("Click 'Start' to begin!"); // Game prompt

  // Timer countdown logic
  useEffect(() => {
    if (isGameActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [isGameActive, timeLeft]);

  const startGame = () => {
    setIsGameActive(true);
    setTimeLeft(10); // Reset the timer
    setClickCount(0); // Reset the click count
    setPrompt("Click as fast as you can!");
  };

  const endGame = () => {
    setIsGameActive(false);
    setPrompt(`Time's up! You clicked ${clickCount} times.`);
  };

  const handleButtonClick = () => {
    if (isGameActive) {
      setClickCount(clickCount + 1); // Increment click count
    }
  };

  return (
    <>
      <Header />
      <Back />
      <div style={styles.container}>
        <h1>Click Speed Test</h1>
        <h2>{prompt}</h2>
        <h3>{isGameActive ? `Time Left: ${timeLeft}s` : `Score: ${clickCount}`}</h3>

        {isGameActive ? (
          <button onClick={handleButtonClick} style={styles.clickButton}>
            Click Me!
          </button>
        ) : (
          <button onClick={startGame} style={styles.startButton}>
            Start Game
          </button>
        )} 
      </div>
    </>
  );
};

// Basic styles for Click Speed Test
const styles = {
  container: {
    fontSize: "1.8rem",
    maxWidth: "500px",
    margin: "50px auto",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    backgroundColor: "#black",
  },
  clickButton: {
    width: "200px",
    height: "100px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "1.5rem",
  },
  startButton: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
  },
};

export default ClickSpeedTest;
