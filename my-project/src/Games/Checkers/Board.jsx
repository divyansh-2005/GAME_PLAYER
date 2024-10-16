import React, { useState } from "react";
import "./Checkers.css";
import Header from "../../Components/Header";

const Board = () => {
  const initialBoard = Array(8)
    .fill(null)
    .map((_, row) =>
      Array(8)
        .fill(null)
        .map((_, col) => {
          if (row < 3 && (row + col) % 2 === 1) return "red";
          if (row > 4 && (row + col) % 2 === 1) return "black";
          return null;
        })
    );

  const [board, setBoard] = useState(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentTurn, setCurrentTurn] = useState("black");

  const handleClick = (row, col) => {
    const piece = board[row][col];

    // If a piece is already selected, try to move it
    if (selectedPiece) {
      const [selectedRow, selectedCol] = selectedPiece;

      // Validate the move
      if (isValidMove(selectedRow, selectedCol, row, col)) {
        const newBoard = board.map((r, rowIndex) =>
          r.map((cell, colIndex) => {
            if (rowIndex === selectedRow && colIndex === selectedCol)
              return null; // Remove the piece from its old position
            if (rowIndex === row && colIndex === col)
              return board[selectedRow][selectedCol]; // Move the piece to the new position
            return cell;
          })
        );

        setBoard(newBoard);
        setSelectedPiece(null); // Deselect the piece after moving
        setCurrentTurn(currentTurn === "black" ? "red" : "black"); // Switch turns
      } else {
        // Invalid move, deselect the piece
        setSelectedPiece(null);
      }
      return; // Stop execution after trying to move
    }

    // Select the piece if it's the player's turn and a piece exists
    if (piece === currentTurn) {
      setSelectedPiece([row, col]);
    }
  };

  // Function to check if a move is valid
  const isValidMove = (startRow, startCol, endRow, endCol) => {
    // Ensure the target cell is empty
    if (board[endRow][endCol] !== null) return false;

    const piece = board[startRow][startCol];
    const rowDiff = endRow - startRow;
    const colDiff = Math.abs(endCol - startCol);

    // Black pieces move forward, red pieces move backward
    if (piece === "black" && rowDiff === 1 && colDiff === 1) return true;
    if (piece === "red" && rowDiff === -1 && colDiff === 1) return true;

    return false;
  };

  return (
    <div>
      <Header />
      <div className="checkers-container">
        <h1>Checkers Game</h1>
        <div className="board">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="board-row">
              {row.map((piece, colIndex) => (
                <div
                  key={colIndex}
                  className={`board-cell ${
                    (rowIndex + colIndex) % 2 === 1
                      ? "black-cell"
                      : "white-cell"
                  }`}
                  onClick={() => handleClick(rowIndex, colIndex)}
                >
                  {piece && (
                    <div
                      className={`piece ${piece} ${
                        selectedPiece &&
                        selectedPiece[0] === rowIndex &&
                        selectedPiece[1] === colIndex
                          ? "selected"
                          : ""
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="turn-indicator">{currentTurn}'s Turn</p>
      </div>
    </div>
  );
};

export default Board;
