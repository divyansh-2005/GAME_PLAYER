
import React, { useState } from "react";
import "./LightsOut.css"; 
import Header from '../../Components/Header';

const numRows = 5;
const numCols = 5;

function LightsOut() {
  const [grid, setGrid] = useState(createGrid());
  const [playerTurn, setPlayerTurn] = useState("Player 1");

 
  function createGrid() {
    let grid = [];
    for (let i = 0; i < numRows; i++) {
      let row = [];
      for (let j = 0; j < numCols; j++) {
        row.push(Math.random() < 0.5);
      }
      grid.push(row);
    }
    return grid;
  }

  
  function toggleLight(row, col) {
    let newGrid = grid.map((r, rowIndex) =>
      r.map((cell, colIndex) => {
        if (rowIndex === row && colIndex === col) {
          return !cell;
        } else if (
          (rowIndex === row && Math.abs(colIndex - col) === 1) ||
          (colIndex === col && Math.abs(rowIndex - row) === 1)
        ) {
          return !cell;
        } else {
          return cell;
        }
      })
    );

    setGrid(newGrid);
    setPlayerTurn((prev) => (prev === "Player 1" ? "Player 2" : "Player 1")); 
  }

 
  function isWin() {
    return grid.every(row => row.every(cell => !cell));
  }

  return (
    <div>
    <Header />
    <br></br>
      <h1 className="title">Lights Out</h1>
      <h2 className="turn-indicator">{playerTurn}'s Turn</h2>
      {isWin() ? (
        <h2 className="win-message">Game Won!</h2>
      ) : (
        <div className="board">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`cell ${cell ? "on" : "off"}`}
                  onClick={() => toggleLight(rowIndex, colIndex)}
                ></div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LightsOut;