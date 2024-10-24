
import React, { useState } from 'react';
import './Battleship.css'; // Ensure to create this CSS file for styling
import Header from '../../Components/Header';

const boardSize = 10;

const initialBoard = () => {
  const board = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(null)
  );

  placeShips(board, 5); // Change the number of ships here
  return board;
};

const placeShips = (board, numShips) => {
  let shipsPlaced = 0;

  while (shipsPlaced < numShips) {
    const shipSize = Math.floor(Math.random() * 3) + 2; // Ship size between 2 and 4
    const orientation = Math.random() < 0.5; // true for horizontal, false for vertical
    const row = Math.floor(Math.random() * boardSize);
    const col = Math.floor(Math.random() * boardSize);

    if (canPlaceShip(board, row, col, shipSize, orientation)) {
      for (let i = 0; i < shipSize; i++) {
        if (orientation) {
          board[row][col + i] = 'S'; // Mark ship positions internally
        } else {
          board[row + i][col] = 'S';
        }
      }
      shipsPlaced++;
    }
  }
};

const canPlaceShip = (board, row, col, size, horizontal) => {
  for (let i = 0; i < size; i++) {
    if (horizontal) {
      if (col + i >= boardSize || board[row][col + i]) {
        return false;
      }
    } else {
      if (row + i >= boardSize || board[row + i][col]) {
        return false;
      }
    }
  }
  return true;
};

const Cell = ({ value, onClick }) => {
  const cellClass = value === 'H' ? 'hit' : value === 'M' ? 'miss' : '';
  return (
    <button className={`cell ${cellClass}`} onClick={onClick}>
      {cellClass === 'hit' ? 'H' : cellClass === 'miss' ? 'M' : ''}
    </button>
  );
};

const Battleship = () => {
  const [player1Board, setPlayer1Board] = useState(initialBoard());
  const [player2Board, setPlayer2Board] = useState(initialBoard());
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [extraTurn, setExtraTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const handleCellClick = (row, col) => {
    const opponentBoard = currentPlayer === 1 ? player2Board : player1Board;
    const newBoard = [...opponentBoard];

    if (newBoard[row][col] === 'H' || newBoard[row][col] === 'M') {
      return; // Cell already clicked
    }

    // Check for hit or miss
    if (newBoard[row][col] === 'S') {
      newBoard[row][col] = 'H'; // Mark as hit
      if (currentPlayer === 1) {
        setPlayer1Score((prevScore) => prevScore + 1);
      } else {
        setPlayer2Score((prevScore) => prevScore + 1);
      }
      setExtraTurn(true); // Give extra turn for a hit
    } else {
      newBoard[row][col] = 'M'; // Mark as miss
      setExtraTurn(false); // No extra turn
    }

    // Update opponent's board
    if (currentPlayer === 1) {
      setPlayer2Board(newBoard);
    } else {
      setPlayer1Board(newBoard);
    }

    // Check for win condition
    if (checkWin(newBoard)) {
      setGameOver(true);
      alert(`Player ${currentPlayer} has won the game!`);
      return;
    }

    // Switch turns only if no extra turn
    if (!extraTurn) {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const checkWin = (board) => {
    return board.flat().every((cell) => cell !== 'S'); // Check if no ships left
  };

  const resetGame = () => {
    setPlayer1Board(initialBoard());
    setPlayer2Board(initialBoard());
    setCurrentPlayer(1);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setExtraTurn(false);
    setGameOver(false);
  };

  const renderBoard = (board, player) => {
    const isCurrentPlayer = currentPlayer === player;
    const boardClass = isCurrentPlayer ? 'neon-border' : '';
    
    return (
      <div className={`board ${boardClass}`}>
        <h3>{`Player ${player}'s Board (Score: ${player === 1 ? player1Score : player2Score})`}</h3>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
              <Cell
                key={colIndex}
                value={cell}
                onClick={() => !gameOver && handleCellClick(rowIndex, colIndex)} // Disable click if game is over
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    
    <div className="battleship-game" >
      <Header style={{ marginBottom: '10px' }} />
      <h1>Battleship Game</h1>
      <h2>{`Player ${currentPlayer}'s Turn`}</h2>
      <div className="boards">
        {renderBoard(player1Board, 1)}
        {renderBoard(player2Board, 2)}
      </div>
      <div className="scoreboard">
        <h3>Scores</h3>
        <p>{`Player 1: ${player1Score} | Player 2: ${player2Score}`}</p>
      </div>
      {gameOver && <button onClick={resetGame}>Reset Game</button>}
    </div>
  );
};

export default Battleship;