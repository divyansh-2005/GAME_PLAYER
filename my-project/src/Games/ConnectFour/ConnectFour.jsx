
import React, { useState } from 'react';
import './ConnectFour.css';
import Header from '../../Components/Header';

const ConnectFour = () => {
  const [board, setBoard] = useState(Array(6).fill(null).map(() => Array(7).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('R');
  const [winner, setWinner] = useState(null);
  const [droppingPiece, setDroppingPiece] = useState({ col: null, row: null, color: null });

  const dropPiece = (col) => {
    if (winner || droppingPiece.col !== null) return;

    const newBoard = board.map(row => [...row]);
    let rowToDrop = null;

    // Find the row to drop the piece
    for (let row = 5; row >= 0; row--) {
      if (!newBoard[row][col]) {
        rowToDrop = row;
        break;
      }
    }

    if (rowToDrop !== null) {
      animateDrop(col, rowToDrop, currentPlayer);
    }
  };

  const animateDrop = (col, finalRow, color) => {
    let currentRow = 0;

    // Simulate piece falling through rows one by one
    const fallInterval = setInterval(() => {
      setDroppingPiece({ col, row: currentRow, color });

      if (currentRow === finalRow) {
        clearInterval(fallInterval);
        placePiece(col, finalRow, color);
      } else {
        currentRow++;
      }
    }, 200); // Adjust the timing for a smoother drop
  };

  const placePiece = (col, row, color) => {
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = color;
    setBoard(newBoard);
    setDroppingPiece({ col: null, row: null, color: null });

    checkWinner(newBoard, row, col);
    setCurrentPlayer(currentPlayer === 'R' ? 'Y' : 'R');
  };

  const checkWinner = (board, row, col) => {
    const directions = [
      [[0, 1], [0, -1]], // horizontal
      [[1, 0], [-1, 0]], // vertical
      [[1, 1], [-1, -1]], // diagonal /
      [[1, -1], [-1, 1]], // diagonal \
    ];

    for (let direction of directions) {
      let count = 1;
      for (let [dx, dy] of direction) {
        let r = row, c = col;
        while (true) {
          r += dx;
          c += dy;
          if (r < 0 || r >= 6 || c < 0 || c >= 7 || board[r][c] !== currentPlayer) break;
          count++;
        }
      }
      if (count >= 4) {
        setWinner(currentPlayer);
        return;
      }
    }
  };

  const renderCell = (row, col) => {
    const isDroppingPieceHere = droppingPiece.col === col && droppingPiece.row === row;

    return (
      <div className="cell" onClick={() => dropPiece(col)} key={col}>
        <div className="hole"></div>
        {board[row][col] && (
          <div className={`piece ${board[row][col]} ${winner ? 'highlight' : ''}`}></div>
        )}
        {isDroppingPieceHere && (
          <div className={`dropping-piece ${droppingPiece.color}`}></div>
        )}
      </div>
    );
  };

  return (
    <>
     <Header style={{ marginBottom: '200px' }} />
    <div className="connect-four">
      <h1 className="neon-title">CONNECT FOUR</h1> 
      {winner && (
        <div className={`winner animate-winner ${winner === 'R' ? 'red-glow' : 'yellow-glow'}`}>
          Winner: {winner === 'R' ? 'Red' : 'Yellow'}
        </div>
      )}
      {!winner && (
        <div className={`turn-display ${currentPlayer === 'R' ? 'red-turn' : 'yellow-turn'}`}>
          Current Turn: {currentPlayer === 'R' ? 'Red' : 'Yellow'}
        </div>
      )}
      <div className="board">
        {board.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </div>
        ))}
      </div>
      <button onClick={() => {
        setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
        setWinner(null);
      }}>
        Restart Game
      </button>
    </div>
    </>
);

  
};

export default ConnectFour;
