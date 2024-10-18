import React, { useState } from "react";
import "./TicTacToe.css";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Back from "../../Components/Back";

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null)); // 3x3 grid
  const [isXNext, setIsXNext] = useState(true); // To toggle between 'X' and 'O'
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false); // State for checking draw

  const handleClick = (index) => {
    if (winner || board[index] || isDraw) return; // Prevent moves if there's a winner, draw, or square is taken

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O"; // Assign 'X' or 'O' based on the turn
    setBoard(newBoard); // Update the board

    const gameWinner = calculateWinner(newBoard); // Check for a winner
    if (gameWinner) {
      setWinner(gameWinner); // Set winner if found
    } else if (newBoard.every((square) => square !== null)) {
      setIsDraw(true); // If all squares are filled and no winner, it's a draw
    } else {
      setIsXNext(!isXNext); // Toggle turn only if no winner
    }
  };

  const calculateWinner = (board) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]; // Return the winner ('X' or 'O')
      }
    }
    return null;
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null)); // Reset board
    setIsXNext(true); // Reset player to 'X'
    setWinner(null); // Reset winner
    setIsDraw(false); // Reset draw
  };

  return (
    <>
      <Header />
      <Back />
      <div className="tic-tac-toe">
        <h1>Tic Tac Toe</h1>
        {winner ? (
          <h2 className="winner">Winner: {winner}</h2>
        ) : isDraw ? (
          <h2>It's a draw!</h2> // Display draw message
        ) : (
          <h2>Next Player: {isXNext ? "X" : "O"}</h2>
        )}
        <div className="board">
          {board.map((value, index) => (
            <button
              key={index}
              className="square"
              onClick={() => handleClick(index)}
            >
              {value} {/* Display 'X', 'O', or null */}
            </button>
          ))}
        </div>
        <button className="restart" onClick={resetGame}>
          Restart Game
        </button>
      </div>
      <Footer />
    </>
  );
};

export default TicTacToe;
