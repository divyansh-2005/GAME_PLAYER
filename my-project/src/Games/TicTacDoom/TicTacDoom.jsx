import React, { useEffect, useState } from 'react';
import './TicTacDoom.css';

const Game = () => {
  const [game, setGame] = useState({
    board: Array(3).fill(null).map(() => Array(3).fill(null)),
    playerMark: '',
    aiMark: '',
    turnsPlayed: 0,
    playerTurn: true,
    nextMove: [null, null],
    winner: '',
    gameOver: false,
  });

  const computerThreats = [
    "Prepare to suffer extreme humiliation!",
    "I will destroy you!",
    "I am invincible!",
    "You cannot defeat me!",
    "You will be annihilated!",
    "You will fail!",
    "Fear me!",
    "Vengeance is mine!",
    "I hunger!",
  ];

  const [currentNarrative, setCurrentNarrative] = useState(1);
  const [computerThreat, setComputerThreat] = useState('');
  const darkColor = "#2c3e50";

  useEffect(() => {
    document.getElementById("game-narrative-one").style.display = 'block';
    document.getElementById("header").style.display = 'none';
    document.getElementById("game-configuration").style.display = 'none';
    document.getElementById("game-grid").style.display = 'none';
    document.getElementById("game-over").style.display = 'none';
  }, []);

  const handleNarrativeNext = () => {
    setCurrentNarrative((prev) => prev + 1);
  };

  const startGame = (mark) => {
    setGame((prev) => ({
      ...prev,
      playerMark: mark,
      aiMark: mark === 'X' ? 'O' : 'X',
      playerTurn: true,
    }));

    document.getElementById("game-configuration").style.display = 'none';
    document.getElementById("game-grid").style.display = 'block';
    if (!game.playerTurn) aiPlay();
  };

  const handleCellClick = (row, col) => {
    if (game.playerTurn && spaceFree(game.board, row, col)) {
      makePlay(game.playerMark, row, col);
      checkPlay(game.playerMark);
    }
  };

  const aiPlay = () => {
    setTimeout(() => {
      minimax(game, 0);
      makePlay(game.aiMark, game.nextMove[0], game.nextMove[1]);
      checkPlay(game.aiMark);

      const randThreat = computerThreats[Math.floor(Math.random() * computerThreats.length)];
      setComputerThreat(randThreat);
      setTimeout(() => setComputerThreat(''), 2000);
    }, 1000);
  };

  // Other game functions (checkPlay, spaceFree, makePlay, minimax, etc.) go here...

  return (
    <div id="container">
      <div className="game-narrative" id="game-narrative-one" style={{ display: currentNarrative === 1 ? 'flex' : 'none' }}>
        <p className="game-narrative-text">In a world where two forces battle for domination of a war-torn landscape, only one will draw the line and reign supreme.</p>
        <button className="game-btn" onClick={handleNarrativeNext}>...</button>
      </div>

      <div className="game-narrative" id="game-narrative-two" style={{ display: currentNarrative === 2 ? 'flex' : 'none' }}>
        <p className="game-narrative-text">The year is 2048.</p>
        <p className="game-narrative-text">In a post apocalyptic galaxy run by giant corporations, you are a cybernetically enhanced space marine with no memory of your past.</p>
        <button className="game-btn" onClick={handleNarrativeNext}>...</button>
      </div>

      <div className="game-narrative" id="game-narrative-three" style={{ display: currentNarrative === 3 ? 'flex' : 'none' }}>
        <p className="game-narrative-text">Are you the chosen one foretold by prophecy?</p>
        <p className="game-narrative-text">Do you have the strength to survive...</p>
        <div id="narrative-three-btns">
          <button className="game-btn" onClick={() => startGame('X')}>YES</button>
          <div></div>
          <a className="game-btn" href="https://au.pinterest.com/explore/puppy-pictures/" target="_blank" rel="noopener noreferrer">NO</a>
        </div>
      </div>

      <div id="header">
        <p className="dramatic-text">
          <span id="tic-text">Tic </span>
          <span id="tac-text">Tac </span>
          <span id="doom-text">DOOM</span>
        </p>
      </div>

      <div id="game-configuration">
        <h2 id="identity-label">Choose your mark</h2>
        <div id="identity-selection" className="row">
          <div className="cell identity-cell" value="X" onClick={() => startGame('X')}>X</div>
          <div className="cell identity-cell" value="O" onClick={() => startGame('O')}>O</div>
        </div>
      </div>

      <div id="game-grid">
        {game.board.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell game-cell ${cell ? 'cell-selected' : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                id={`c${rowIndex}${colIndex}`}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
        <div className="computer-threat">
          <p><span id="computer-threat-text">{computerThreat}</span></p>
        </div>
      </div>

      <div id="game-over" style={{ display: game.gameOver ? 'flex' : 'none' }}>
        <h2 id="game-end-heading">{game.winner === game.playerMark ? "You have claimed victory." : "Alas, the computer has claimed victory!"}</h2>
        <h3 id="game-end-subheading">{game.winner === game.playerMark ? "May you bathe in tic-tac-toe glory." : "May they bathe their circuits in tic-tac-toe glory."}</h3>
        <button className="game-btn" onClick={resetGame}>&#8634; Play again</button>
      </div>
    </div>
  );
};

export default Game;
