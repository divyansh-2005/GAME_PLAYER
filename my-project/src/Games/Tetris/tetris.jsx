import React, { useState, useEffect } from 'react';
import './App.css';

const gridWidth = 10;
const gridHeight = 20;
const tetrominoes = {
  0: { shape: [[0]], color: '0, 0, 0' },
  I: { shape: [[1, 1, 1, 1]], color: '80, 227, 230' },
  J: { shape: [[0, 0, 1], [1, 1, 1]], color: '36, 95, 223' },
  L: { shape: [[1, 0, 0], [1, 1, 1]], color: '223, 173, 36' },
  O: { shape: [[1, 1], [1, 1]], color: '223, 217, 36' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '48, 211, 56' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '227, 78, 78' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '132, 61, 198' }
};

// Helper function to create the game grid
const createGrid = () => {
  return Array.from(Array(gridHeight), () => Array(gridWidth).fill([0, 'clear']));
};

// Random tetromino selector
const randomTetromino = () => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return tetrominoes[randTetromino];
};

// Tetris Component
const App = () => {
  const [grid, setGrid] = useState(createGrid());
  const [tetromino, setTetromino] = useState(randomTetromino());
  const [position, setPosition] = useState({ row: 0, col: Math.floor(gridWidth / 2) - 2 });

  // Draw tetromino on the grid
  const drawTetromino = () => {
    const newGrid = createGrid();
    tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newGrid[y + position.row][x + position.col] = [tetromino.shape[y][x], tetromino.color];
        }
      });
    });
    setGrid(newGrid);
  };

  // Drop tetromino by one row
  const drop = () => {
    setPosition((prev) => ({
      ...prev,
      row: prev.row + 1
    }));
  };

  // Movement with arrow keys
  const move = ({ keyCode }) => {
    if (keyCode === 37) {
      setPosition((prev) => ({
        ...prev,
        col: prev.col - 1
      }));
    } else if (keyCode === 39) {
      setPosition((prev) => ({
        ...prev,
        col: prev.col + 1
      }));
    } else if (keyCode === 40) {
      drop();
    }
  };

  // Handle game update
  useEffect(() => {
    drawTetromino();
    document.addEventListener('keydown', move);
    return () => document.removeEventListener('keydown', move);
  }, [tetromino, position]);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      drop();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="Tetris">
      <div className="grid">
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="cell"
              style={{
                backgroundColor: `rgba(${cell[1]})`,
                border: cell[0] ? '1px solid rgba(0, 0, 0, 0.2)' : 'none'
              }}
            ></div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tetris;
