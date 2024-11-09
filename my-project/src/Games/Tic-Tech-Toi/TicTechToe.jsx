/** @format */

import React, { useState, useEffect } from "react";
import Header from "../../Components/Header";
import Back from "../../Components/Back";
import Footer from "../../Components/Footer";

function TicTechToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const aiMove = getAiMove(board);
      if (aiMove !== -1) {
        const newBoard = board.slice();
        newBoard[aiMove] = "O";
        setBoard(newBoard);
        setIsPlayerTurn(true);
      }
    }
    const result = calculateWinner(board);
    if (result) setWinner(result);
  }, [isPlayerTurn, board, winner]);

  const handleClick = (index) => {
    if (board[index] || winner || !isPlayerTurn) return;
    const newBoard = board.slice();
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsPlayerTurn(false);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
  };

  const getAiMove = (board) => {
    const availableMoves = board
      .map((cell, index) => (cell === null ? index : null))
      .filter((index) => index !== null);
    return availableMoves.length > 0
      ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
      : -1;
  };

  const status = winner
    ? winner === "Draw"
      ? "It's a Draw!"
      : `Winner: ${winner}`
    : `Next Player: ${isPlayerTurn ? "X" : "O"}`;

  return (
    <>
    <Header />
    <Back />
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-100 to-blue-800">
        <div className="text-center p-8 bg-white shadow-lg rounded-lg">
          <h1 className="text-3xl font-bold text-gray-700 mb-6">
            Tic-Tac-Toe
          </h1>
          <div className="grid grid-cols-3 gap-4 w-80 mx-auto mb-6">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleClick(index)}
                className={`h-20 w-20 bg-blue-50 border border-blue-300 rounded-lg text-3xl font-bold text-blue-700 flex items-center justify-center hover:bg-blue-100 ${
                  cell === "X" ? "text-red-500" : "text-green-500"
                }`}
              >
                {cell}
              </button>
            ))}
          </div>
          <p className="text-xl font-semibold text-gray-700 mb-4">{status}</p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
          >
            Reset Game
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}

function calculateWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return board.every((cell) => cell) ? "Draw" : null;
}

export default TicTechToe;
