import React, { useState, useEffect } from "react";
import Header from "../../Components/Header";
import Back from "../../Components/Back";

const MathQuiz = () => {
  const [score, setScore] = useState(0); // Player's score
  const [question, setQuestion] = useState({}); // Current question object
  const [choices, setChoices] = useState([]); // Multiple choice answers
  const [timeLeft, setTimeLeft] = useState(30); // Timer for each question
  const [gameOver, setGameOver] = useState(false); // Game over state
  const [prompt, setPrompt] = useState("Answer as many questions as you can!");

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      setPrompt(`Game Over! Your score: ${score}`);
    }
  }, [timeLeft, gameOver, score]);

  useEffect(() => {
    if (!gameOver) {
      generateQuestion(); // Generate a new question on game start or after each answer
    }
  }, [gameOver]);

  const generateQuestion = () => {
    const operations = ["+", "-", "*", "/", "^", "%"];
    const num1 = Math.floor(Math.random() * 20) + 1; // Random number between 1-20
    const num2 = Math.floor(Math.random() * 10) + 1; // Random number between 1-10
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let correctAnswer;
    let questionText;

    // Handle different operations
    switch (operation) {
      case "+":
        correctAnswer = num1 + num2;
        questionText = `${num1} + ${num2}`;
        break;
      case "-":
        correctAnswer = num1 - num2;
        questionText = `${num1} - ${num2}`;
        break;
      case "*":
        correctAnswer = num1 * num2;
        questionText = `${num1} * ${num2}`;
        break;
      case "/":
        correctAnswer = (num1 / num2).toFixed(2); // Round to 2 decimal places
        questionText = `${num1} / ${num2}`;
        break;
      case "^":
        correctAnswer = Math.pow(num1, num2);
        questionText = `${num1} ^ ${num2}`;
        break;
      case "%":
        correctAnswer = num1 % num2;
        questionText = `${num1} % ${num2}`;
        break;
      default:
        correctAnswer = num1 + num2;
        questionText = `${num1} + ${num2}`;
    }

    setQuestion({ text: questionText, correctAnswer });

    // Generate 3 random incorrect answers
    const randomAnswers = Array.from({ length: 3 }, () =>
      Math.floor(Math.random() * 100)
    );
    const answerChoices = [...randomAnswers, correctAnswer].sort(
      () => 0.5 - Math.random()
    );

    setChoices(answerChoices);
  };

  const handleAnswerClick = (answer) => {
    if (answer === parseFloat(question.correctAnswer)) {
      setScore(score + 1);
      setPrompt("Correct! Next question coming up...");
    } else {
      setPrompt("Wrong! Try the next one.");
    }

    // Generate the next question
    generateQuestion();
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setPrompt("Let's go! Answer as many as you can.");
    generateQuestion();
  };

  return (
    <>
      <Header />
      <Back />
      <div style={styles.container}>
        <h1>Math Quiz</h1>
        <h2>{prompt}</h2>
        <h2>{!gameOver && `Time left: ${timeLeft}s`}</h2>
        {gameOver ? (
          <button onClick={startGame} style={styles.startButton}>
            Start Again
          </button>
        ) : (
          <>
            <h3>{question.text}</h3>
            <div style={styles.choicesGrid}>
              {choices.map((choice, index) => (
                <button
                  key={index}
                  style={styles.choiceButton}
                  onClick={() => handleAnswerClick(choice)}
                >
                  {choice}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

const styles = {
  container: {
    fontSize: "1.8rem",
    maxWidth: "500px",
    margin: "50px auto",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    backgroundColor: "black",
  },
  choicesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 150px)",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "20px",
  },
  choiceButton: {
    width: "150px",
    height: "50px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "1.2rem",
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
};

export default MathQuiz;
