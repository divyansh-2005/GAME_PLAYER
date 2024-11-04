/** @format */

import React, { useState, useEffect } from "react";
import Header from "../../Components/Header";
import Back from "../../Components/Back";
import Footer from "../../Components/Footer";

const BOARD_SIZE = 8;

const Othello = () => {
  const [board, setBoard] = useState(
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState("black");

  useEffect(() => {
    const newBoard = board.map((row) => row.slice());
    newBoard[3][3] = "white";
    newBoard[3][4] = "black";
    newBoard[4][3] = "black";
    newBoard[4][4] = "white";
    setBoard(newBoard);
  }, []);

  const isValidMove = (row, col, player) => {
    if (board[row][col]) return false;
    return getFlippablePieces(row, col, player).length > 0;
  };

  const handleMove = (row, col) => {
    if (isValidMove(row, col, currentPlayer)) {
      const newBoard = board.map((row) => row.slice());
      newBoard[row][col] = currentPlayer;
      flipPieces(row, col, currentPlayer, newBoard);
      setBoard(newBoard);
      setCurrentPlayer(currentPlayer === "black" ? "white" : "black");
    }
  };

  const flipPieces = (row, col, player, boardToFlip) => {
    const flippablePieces = getFlippablePieces(row, col, player);
    flippablePieces.forEach(([r, c]) => {
      boardToFlip[r][c] = player;
    });
  };

  const getFlippablePieces = (row, col, player) => {
    const opponent = player === "black" ? "white" : "black";
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
    ];
    const flippablePieces = [];

    directions.forEach(([dx, dy]) => {
      let r = row + dx;
      let c = col + dy;
      const piecesInLine = [];

      while (
        r >= 0 &&
        r < BOARD_SIZE &&
        c >= 0 &&
        c < BOARD_SIZE &&
        board[r][c] === opponent
      ) {
        piecesInLine.push([r, c]);
        r += dx;
        c += dy;
      }

      if (
        r >= 0 &&
        r < BOARD_SIZE &&
        c >= 0 &&
        c < BOARD_SIZE &&
        board[r][c] === player
      ) {
        flippablePieces.push(...piecesInLine);
      }
    });

    return flippablePieces;
  };

  return (
    <>
      <Header />
      <Back />
      <div className="flex flex-col items-center justify-center  w-screen bg-gray-800 p-12 text-white">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          Othello Game
        </h1>
        <div
          id="board"
          className="grid grid-cols-8 gap-1 border-2 border-gray-300 rounded-lg bg-green-800 shadow-lg"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
            width: "100%",
            maxWidth: "320px",
            maxHeight: "320px",
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="flex items-center justify-center cursor-pointer bg-green-600 hover:bg-green-500 transition-colors duration-300"
                onClick={() => handleMove(rowIndex, colIndex)}
                style={{ aspectRatio: "1 / 1" }} // Ensures square cells
              >
                {cell && (
                  <div
                    className={`w-11 h-11 rounded-full ${
                      cell === "black" ? "bg-black" : "bg-white"
                    }`}
                  ></div>
                )}
              </div>
            ))
          )}
        </div>
        <div className="mt-6 text-xl font-semibold">
          Current Turn:{" "}
          <span
            className={`${
              currentPlayer === "black" ? "text-black" : "text-white"
            } px-2 py-1 rounded-full`}
            style={{
              backgroundColor: currentPlayer === "black" ? "#333" : "#fff",
              color: currentPlayer === "black" ? "#fff" : "#333",
            }}
          >
            {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}
          </span>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Othello;
