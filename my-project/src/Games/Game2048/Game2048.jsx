import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import './Game2048.css';

const Game2048 = () => {
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initializeGame();
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const initializeGame = () => {
    let newBoard = Array(4).fill().map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
  };

  const addRandomTile = (board) => {
    const emptyTiles = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyTiles.push([i, j]);
        }
      }
    }
    if (emptyTiles.length > 0) {
      const [i, j] = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
      board[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const handleMove = (direction) => {
    if (gameOver) return;

    let newBoard = JSON.parse(JSON.stringify(board));
    let moved = false;

    switch (direction) {
      case 'UP':
        moved = moveUp(newBoard);
        break;
      case 'DOWN':
        moved = moveDown(newBoard);
        break;
      case 'LEFT':
        moved = moveLeft(newBoard);
        break;
      case 'RIGHT':
        moved = moveRight(newBoard);
        break;
      default:
        return;
    }

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(calculateScore(newBoard));
      if (isGameOver(newBoard)) {
        setGameOver(true);
      }
    }
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowUp':
        handleMove('UP');
        break;
      case 'ArrowDown':
        handleMove('DOWN');
        break;
      case 'ArrowLeft':
        handleMove('LEFT');
        break;
      case 'ArrowRight':
        handleMove('RIGHT');
        break;
      default:
        return;
    }
  };

  const handlers = useSwipeable({
    onSwipedUp: () => handleMove('UP'),
    onSwipedDown: () => handleMove('DOWN'),
    onSwipedLeft: () => handleMove('LEFT'),
    onSwipedRight: () => handleMove('RIGHT'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const moveUp = (board) => {
    let moved = false;
    for (let j = 0; j < 4; j++) {
      let column = [board[0][j], board[1][j], board[2][j], board[3][j]];
      let { newColumn, columnMoved } = mergeTiles(column);
      moved = moved || columnMoved;
      for (let i = 0; i < 4; i++) {
        board[i][j] = newColumn[i];
      }
    }
    return moved;
  };

  const moveDown = (board) => {
    let moved = false;
    for (let j = 0; j < 4; j++) {
      let column = [board[3][j], board[2][j], board[1][j], board[0][j]];
      let { newColumn, columnMoved } = mergeTiles(column);
      moved = moved || columnMoved;
      for (let i = 0; i < 4; i++) {
        board[3-i][j] = newColumn[i];
      }
    }
    return moved;
  };

  const moveLeft = (board) => {
    let moved = false;
    for (let i = 0; i < 4; i++) {
      let { newRow, rowMoved } = mergeTiles(board[i]);
      moved = moved || rowMoved;
      board[i] = newRow;
    }
    return moved;
  };

  const moveRight = (board) => {
    let moved = false;
    for (let i = 0; i < 4; i++) {
      let { newRow, rowMoved } = mergeTiles(board[i].reverse());
      moved = moved || rowMoved;
      board[i] = newRow.reverse();
    }
    return moved;
  };

  const mergeTiles = (row) => {
    let newRow = row.filter(tile => tile !== 0);
    let columnMoved = newRow.length !== row.length;

    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i+1]) {
        newRow[i] *= 2;
        newRow.splice(i+1, 1);
        columnMoved = true;
      }
    }

    while (newRow.length < 4) {
      newRow.push(0);
    }

    return { newRow, columnMoved };
  };

  const calculateScore = (board) => {
    return board.flat().reduce((sum, tile) => sum + tile, 0);
  };

  const isGameOver = (board) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return false;
        if (i < 3 && board[i][j] === board[i+1][j]) return false;
        if (j < 3 && board[i][j] === board[i][j+1]) return false;
      }
    }
    return true;
  };

  return (
    <div className="game-2048" tabIndex="0" {...handlers}>
      <h1>2048</h1>
      <div className="score">Score: {score}</div>
      <div className="board">
        {board.map((row, i) => (
          <div key={i} className="row">
            {row.map((cell, j) => (
              <div key={j} className={`cell cell-${cell}`}>
                {cell !== 0 && cell}
              </div>
            ))}
          </div>
        ))}
      </div>
      {gameOver && <div className="game-over">Game Over!</div>}
      <button onClick={initializeGame}>New Game</button>
    </div>
  );
};

export default Game2048;
