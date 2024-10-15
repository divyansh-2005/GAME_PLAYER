// src/ReactionTimeGame.js
import React, { useState, useEffect } from 'react';
import './ReactionTimeGame.css';
import Footer from '../../Components/Footer';
import Header from '../../Components/Header';
const ReactionTimeGame = () => {
  const [gameState, setGameState] = useState('waiting');
  const [message, setMessage] = useState('If you\'re ready, click to start!');
  const [reactionTime, setReactionTime] = useState(null);
  let timeoutId = null; // Use a variable instead of state for timeoutId
  let startTime = null; // Use a variable to track the start time

  useEffect(() => {
    if (gameState === 'waiting') {
      setMessage('If you\'re ready, click to start!');
    } else if (gameState === 'ready') {
      setMessage('Waiting...');
      timeoutId = setTimeout(() => {
        setGameState('go');
        setMessage('Click Now!');
      }, Math.random() * 2000 + 1000); // Random time between 1-3 seconds
    } else if (gameState === 'go') {
      setMessage('Click!');
    }

    return () => {
      clearTimeout(timeoutId); // Cleanup the timeout
    };
  }, [gameState]); // Only depend on gameState

  const handleClick = () => {
    if (gameState === 'waiting') {
      startTime = Date.now(); // Record start time
      setGameState('ready');
    } else if (gameState === 'go') {
      const endTime = Date.now();
      const timeTaken = endTime - startTime; // Calculate reaction time
      setReactionTime(timeTaken % 1000); // Get last 3 digits for milliseconds
      setGameState('waiting');
    }
  };

  const startGame = () => {
    setGameState('waiting');
    setReactionTime(null);
  };

  return (
    <>
    <Header/>
    <div className="reaction-game-container">
      <div className={`reaction-card ${gameState}`} onClick={handleClick}>
        <h2 className="reaction-message">{message}</h2>
      </div>
      {reactionTime !== null && (
        <p className="reaction-time">Your reaction time: {reactionTime.toString().padStart(3, '0')} ms</p>
      )}
      <button className="restart-button" onClick={startGame}>Restart Game</button>
    </div>
    <Footer/></>
    
  );
};

export default ReactionTimeGame;
