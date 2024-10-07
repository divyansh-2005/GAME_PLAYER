import React, { useState } from "react";
import Header from "../../Components/Header";

const NumberGuessing = () => {
  const [targetNumber, setTargetNumber] = useState(
    generateRandomNumber(1, 100)
  );
  const [userGuess, setUserGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [attempts, setAttempts] = useState(0);

  function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    const guess = parseInt(userGuess, 10);

    if (isNaN(guess)) {
      setFeedback("Please enter a valid number!");
      return;
    }

    setAttempts(attempts + 1);

    if (guess < targetNumber) {
      setFeedback("Too low!");
    } else if (guess > targetNumber) {
      setFeedback("Too high!");
    } else {
      setFeedback(
        `Congratulations! You've guessed the number in ${
          attempts + 1
        } attempts.`
      );
    }
  };

  const handleReset = () => {
    setTargetNumber(generateRandomNumber(1, 100));
    setUserGuess("");
    setFeedback("");
    setAttempts(0);
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h1>Number Guessing Game</h1>
        <p>Guess the number between 1 and 100</p>

        <form onSubmit={handleGuessSubmit} style={styles.form}>
          <input
            type="number"
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            style={styles.input}
            placeholder="Enter your guess"
          />
          <button type="submit" style={styles.button}>
            Guess
          </button>
        </form>

        {feedback && <p style={styles.feedback}>{feedback}</p>}

        <button onClick={handleReset} style={styles.resetButton}>
          Reset Game
        </button>
      </div>
    </>
  );
};

// Basic styles for a user-friendly UI
const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
  },
  form: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    width: "150px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
  },
  feedback: {
    marginTop: "20px",
    fontSize: "18px",
    color: "#333",
  },
  resetButton: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "#fff",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
  },
};

export default NumberGuessing;
