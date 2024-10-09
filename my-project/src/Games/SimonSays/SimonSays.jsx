import React, { useState, useEffect } from "react";
import Header from "../../Components/Header";

const SimonSays = () => {
  const [colors] = useState(["red", "blue", "green", "yellow"]);
  const [sequence, setSequence] = useState([]); // Stores the sequence of colors
  const [playerSequence, setPlayerSequence] = useState([]); // Tracks the player's input
  const [currentStep, setCurrentStep] = useState(0); // Tracks the current sequence step
  const [isPlayerTurn, setIsPlayerTurn] = useState(false); // Checks if it's player's turn
  const [gameOver, setGameOver] = useState(false); // Game over state
  const [isPlaying, setIsPlaying] = useState(false); // Game active state
  const [activeColor, setActiveColor] = useState(null); // Flashing active color
  const [prompt, setPrompt] = useState("Click 'Start Game' to begin."); // Instructional prompts

  useEffect(() => {
    if (isPlaying && currentStep === sequence.length) {
      setPrompt("Your turn! Repeat the sequence.");
      setIsPlayerTurn(true);
    }
  }, [currentStep, sequence, isPlaying]);

  useEffect(() => {
    if (playerSequence.length === sequence.length && isPlayerTurn) {
      if (JSON.stringify(playerSequence) === JSON.stringify(sequence)) {
        setPrompt("Good job! Next round coming up...");
        setTimeout(() => {
          nextRound();
        }, 1000);
      } else {
        setPrompt("Game Over! You made a mistake.");
        setGameOver(true);
        setIsPlaying(false);
      }
    }
  }, [playerSequence, sequence, isPlayerTurn]);

  const startGame = () => {
    setPrompt("Watch carefully!");
    setGameOver(false);
    setPlayerSequence([]);
    setSequence([]); // Properly reset sequence when starting a new game
    setIsPlaying(true);
    nextRound();
  };

  const nextRound = () => {
    setPlayerSequence([]); // Reset player's sequence
    setIsPlayerTurn(false); // Not player's turn yet
    setCurrentStep(0); // Reset the current step

    const nextColor = colors[Math.floor(Math.random() * colors.length)];
    setSequence((prev) => {
      const newSequence = [...prev, nextColor];
      playSequence(newSequence); // Play the new sequence
      return newSequence;
    });
  };

  const playSequence = (sequence) => {
    sequence.forEach((color, index) => {
      setTimeout(() => {
        setActiveColor(color); // Flash the color
      }, (index + 1) * 600);

      setTimeout(() => {
        setActiveColor(null); // Remove flash
      }, (index + 1) * 600 + 500);
    });

    // Once the sequence finishes playing, update currentStep
    setTimeout(() => {
      setCurrentStep(sequence.length);
    }, sequence.length * 1000);
  };

  const handleColorClick = (color) => {
    if (!isPlayerTurn) return; // Ignore clicks when not player's turn

    setPlayerSequence((prev) => [...prev, color]);

    if (color !== sequence[playerSequence.length]) {
      setPrompt("Game Over! You made a mistake.");
      setGameOver(true);
      setIsPlaying(false);
    }
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h1>Simon Says</h1>
        <h2>{prompt}</h2>

        {gameOver && <h2 style={styles.feedback}>Game Over</h2>}

        <div style={styles.colorGrid}>
          {colors.map((color) => (
            <button
              key={color}
              style={{
                ...styles.colorButton,
                backgroundColor: color,
                opacity: activeColor === color ? 1 : 0.5,
              }}
              onClick={() => handleColorClick(color)}
              disabled={!isPlayerTurn} // Disable buttons when it's not the player's turn
            />
          ))}
        </div>

        <button
          onClick={startGame}
          style={styles.startButton}
          disabled={isPlaying}
        >
          {isPlaying ? "Game in Progress..." : "Start Game"}
        </button>
      </div>
    </>
  );
};

// Basic styles for Simon Says
const styles = {
  container: {
    fontSize: "1.8rem",
    maxWidth: "500px",
    margin: "50px auto",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
  },
  colorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 150px)",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "20px",
  },
  colorButton: {
    width: "150px",
    height: "150px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "opacity 0.3s",
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
  feedback: {
    color: "#d9534f",
  },
};

export default SimonSays;
