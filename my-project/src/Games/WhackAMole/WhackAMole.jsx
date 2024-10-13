import React, { useState, useEffect } from "react";
import Header from "../../Components/Header";

const WhackAMole = () => {
  const [moles, setMoles] = useState(Array(9).fill(false)); // Array for mole positions
  const [score, setScore] = useState(0); // Track the score
  const [timeLeft, setTimeLeft] = useState(30); // Game timer
  const [isPlaying, setIsPlaying] = useState(false); // Track game state
  const [activeMole, setActiveMole] = useState(null); // Store current active mole

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (isPlaying) {
      const moleInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * moles.length);
        setActiveMole(randomIndex);
        setTimeout(() => setActiveMole(null), 600); // Mole disappears after 600ms
      }, 1000);

      return () => clearInterval(moleInterval);
    }
  }, [isPlaying]);

  const handleMoleClick = (index) => {
    if (index === activeMole) {
      setScore((prev) => prev + 1);
      setActiveMole(null); // Remove mole after hit
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30); // Reset the timer
    setIsPlaying(true);
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h1>Whack-a-Mole</h1>
        <h2>{isPlaying ? `Time Left: ${timeLeft}s` : "Game Over"}</h2>
        <h2>Score: {score}</h2>

        <div style={styles.grid}>
          {moles.map((_, index) => (
            <div
              key={index}
              style={{
                ...styles.hole,
                backgroundColor: index === activeMole ? "brown" : "#ccc",
                transform: index === activeMole ? "scale(1.2)" : "scale(1)",
                transition: "transform 0.3s ease",
              }}
              onClick={() => handleMoleClick(index)}
            />
          ))}
        </div>

        <button onClick={startGame} style={styles.startButton}>
          {isPlaying ? "Game in Progress..." : "Start Game"}
        </button>
      </div>
    </>
  );
};

// Basic styles for Whack-a-Mole
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 100px)",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "20px",
  },
  hole: {
    width: "100px",
    height: "100px",
    backgroundColor: "#ccc",
    borderRadius: "50%",
    cursor: "pointer",
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

export default WhackAMole;
