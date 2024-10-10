import React, { useState } from 'react';
import './style.css';

const GuessTheNumber = () => {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [target, setTarget] = useState(null);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState('');

 
  const startGame = () => {
    const minNum = parseInt(min);
    const maxNum = parseInt(max);

    if (isNaN(minNum) || isNaN(maxNum) || minNum >= maxNum) {
      alert('Please enter valid minimum and maximum numbers where the minimum is less than the maximum.');
      return;
    }

    const randomNumber = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    setTarget(randomNumber);
    setGameStarted(true);
    setGuess('');
    setMessage('Game Started! Make your guess.');
  };

  const handleGuess = () => {
    const guessedNum = parseInt(guess);

    if (isNaN(guessedNum)) {
      setMessage('Please enter a valid number for your guess.');
      return;
    }

    if (guessedNum === target) {
      setMessage('Congratulations! You guessed the number.');
      setScore(score + 20);
      setGameStarted(false); 
    } else {
      setMessage('Wrong guess! Try again.');
      setScore(score - 1);
    }
  };

 
  const handleExit = () => {
    const confirmExit = window.confirm('Do you want to exit the game?');
    if (confirmExit) {
      alert(`Your final score is: ${score}`);
      resetGame();
    }
  };

 
  const resetGame = () => {
    setMin('');
    setMax('');
    setTarget(null);
    setGuess('');
    setScore(0);
    setGameStarted(false);
    setMessage('');
  };

  return (
    <div className="game-container">
      <h1 className="title">Guess the Number</h1>

      {!gameStarted && (
        <div className="input-container">
          <input
            type="number"
            placeholder="Min Number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
          <button className="start-btn" onClick={startGame}>Start Game</button>
        </div>
      )}

      {gameStarted && (
        <div className="gameplay-container">
          <input
            type="number"
            placeholder="Enter your guess"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
          />
          <button className="guess-btn" onClick={handleGuess}>Guess</button>
          <button className="exit-btn" onClick={handleExit}>Exit Game</button>
        </div>
      )}

      {message && <div className="score-section">{message}</div>}

      <div className="score-section">
        <strong>Score:</strong> {score}
      </div>
    </div>
  );
};

export default GuessTheNumber;
