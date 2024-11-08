/** @format */

import React, { useState } from "react";
import Header from "../../Components/Header";
import Back from "../../Components/Back";
import Footer from "../../Components/Footer";

const BOARD_SIZE = 8;

const generateBoard = () => {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({
      owner: null, // no player has claimed the tile
      score: Math.floor(Math.random() * 10) + 1, // random score between 1 and 10
    }))
  );
};

const TileConquest = () => {
  const [board, setBoard] = useState(generateBoard());
  const [currentPlayer, setCurrentPlayer] = useState("Player 1");
  const [scores, setScores] = useState({ "Player 1": 0, "Player 2": 0 });

  const handleTileClick = (row, col) => {
    if (board[row][col].owner) return; // Tile already claimed

    // Claim the tile for the current player
    const newBoard = board.map((r, rowIndex) =>
      r.map((tile, colIndex) =>
        rowIndex === row && colIndex === col
          ? { ...tile, owner: currentPlayer }
          : tile
      )
    );

    // Update the score for the current player
    const newScores = { ...scores };
    newScores[currentPlayer] += board[row][col].score;

    setBoard(newBoard);
    setScores(newScores);
    setCurrentPlayer(currentPlayer === "Player 1" ? "Player 2" : "Player 1");
  };

  return (
    <>
      <Header />
      <Back />
      <div className="flex flex-col items-center justify-center p-12 bg-gray-900 text-white p-6">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Tile Capturing Game
        </h1>

        <div className="flex space-x-6 mb-4 text-lg">
          <p className="text-yellow-400">
            Player 1 Score: {scores["Player 1"]}
          </p>
          <p className="text-blue-400">Player 2 Score: {scores["Player 2"]}</p>
        </div>

        <h2 className="text-2xl font-semibold mb-4">
          Current Turn:{" "}
          <span
            className={
              currentPlayer === "Player 1" ? "text-yellow-400" : "text-blue-400"
            }
          >
            {currentPlayer}
          </span>
        </h2>

        <div
          className="grid grid-cols-8 gap-1 bg-gray-700 p-2 rounded-lg"
          style={{ width: "400px", height: "400px" }}
        >
          {board.map((row, rowIndex) =>
            row.map((tile, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`w-full h-full flex items-center justify-center rounded-md cursor-pointer ${
                  tile.owner === "Player 1"
                    ? "bg-yellow-400 text-gray-900"
                    : tile.owner === "Player 2"
                    ? "bg-blue-400 text-gray-900"
                    : "bg-gray-800 text-white"
                } hover:bg-gray-600`}
                onClick={() => handleTileClick(rowIndex, colIndex)}
              >
                {tile.owner ? tile.owner : tile.score}
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TileConquest;
