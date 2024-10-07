import { useState } from 'react';
import './tictactoe.css';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';

const Tictactoe = () => {
  const [board, setBoard] = useState(Array(9).fill(null)); // 3x3 board
  const [isXNext, setIsXNext] = useState(true); // X goes first
  const [winner, setWinner] = useState(null);

  const handleClick = (index) => {
    if (board[index] || winner) return; // If square is filled or game over, return
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O'; // Set X or O
    setBoard(newBoard);
    setIsXNext(!isXNext);
    checkWinner(newBoard);
  };

  const checkWinner = (board) => {
    const winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let combo of winningCombos) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        return;
      }
    }

    if (!board.includes(null)) {
      setWinner('Draw');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  return (
    <>
      <Header />
      <div className="game-container">
        <h1 className="game-title">Tic Tac Toe</h1>
        <div className="board">
          {board.map((cell, index) => (
            <div
              key={index}
              className="square"
              onClick={() => handleClick(index)}
            >
              {cell}
            </div>
          ))}
        </div>
        <div className="game-info">
          {winner ? (
            <h2 className="winner-message">
              {winner === 'Draw' ? "It's a draw!" : `Winner: ${winner}`}
            </h2>
          ) : (
            <h2 className="turn-message">
              Next Player: {isXNext ? 'X' : 'O'}
            </h2>
          )}
        </div>
        <button className="reset-btn" onClick={resetGame}>Reset Game</button>
      </div>
      <Footer />
    </>
  );
};

export default Tictactoe;
