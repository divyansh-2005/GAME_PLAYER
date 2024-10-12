import React, { useState } from 'react';
import './ChessGame.css';
import Header from '../../Components/Header';

const pieces = {
  w: {
    rook: '♖',
    knight: '♘',
    bishop: '♗',
    queen: '♕',
    king: '♔',
    pawn: '♙',
  },
  b: {
    rook: '♜',
    knight: '♞',
    bishop: '♝',
    queen: '♛',
    king: '♚',
    pawn: '♟',
  },
};

const initialBoardSetup = [
  ["b.rook", "b.knight", "b.bishop", "b.queen", "b.king", "b.bishop", "b.knight", "b.rook"],
  ["b.pawn", "b.pawn", "b.pawn", "b.pawn", "b.pawn", "b.pawn", "b.pawn", "b.pawn"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["w.pawn", "w.pawn", "w.pawn", "w.pawn", "w.pawn", "w.pawn", "w.pawn", "w.pawn"],
  ["w.rook", "w.knight", "w.bishop", "w.queen", "w.king", "w.bishop", "w.knight", "w.rook"],
];

const ChessGame = () => {
  const [board, setBoard] = useState(initialBoardSetup);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [turn, setTurn] = useState("w");

  const isPathClear = (startRow, startCol, targetRow, targetCol) => {
    const rowStep = targetRow > startRow ? 1 : targetRow < startRow ? -1 : 0;
    const colStep = targetCol > startCol ? 1 : targetCol < startCol ? -1 : 0;

    let currentRow = startRow + rowStep;
    let currentCol = startCol + colStep;

    while (currentRow !== targetRow || currentCol !== targetCol) {
      if (board[currentRow][currentCol] !== "") {
        return false; 
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
    return true; 
  };

  const isValidMove = (piece, startRow, startCol, targetRow, targetCol) => {
    const pieceColor = piece[0];
    const pieceType = piece.split('.')[1];

    if (board[targetRow][targetCol] && board[targetRow][targetCol][0] === pieceColor) {
      return false;
    }

    const rowDiff = targetRow - startRow;
    const colDiff = targetCol - startCol;

    switch (pieceType) {
      case 'pawn':
        const direction = pieceColor === 'w' ? -1 : 1;
        const startRowPawn = pieceColor === 'w' ? 6 : 1;
        return (rowDiff === direction && colDiff === 0 && !board[targetRow][targetCol]) || 
               (rowDiff === direction && Math.abs(colDiff) === 1 && board[targetRow][targetCol] && board[targetRow][targetCol][0] !== pieceColor) ||
               (startRow === startRowPawn && rowDiff === 2 * direction && colDiff === 0 && !board[targetRow][targetCol] && !board[startRow + direction][colDiff]);

      case 'rook':
        return (rowDiff === 0 || colDiff === 0) && isPathClear(startRow, startCol, targetRow, targetCol);

      case 'knight':
        return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);

      case 'bishop':
        return Math.abs(rowDiff) === Math.abs(colDiff) && isPathClear(startRow, startCol, targetRow, targetCol);

      case 'queen':
        return (Math.abs(rowDiff) === Math.abs(colDiff) || rowDiff === 0 || colDiff === 0) && isPathClear(startRow, startCol, targetRow, targetCol);

      case 'king':
        return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;

      default:
        return false;
    }
  };

  const highlightValidMoves = (piece, rowIndex, colIndex) => {
    const moves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (isValidMove(piece, rowIndex, colIndex, r, c)) {
          moves.push({ row: r, col: c });
        }
      }
    }
    setValidMoves(moves);
  };

  const handleSquareClick = (rowIndex, colIndex) => {
    const piece = board[rowIndex][colIndex];
    if (selectedPiece) {
      if (validMoves.some(move => move.row === rowIndex && move.col === colIndex)) {
        movePiece(rowIndex, colIndex);
      }
      setSelectedPiece(null);
      setValidMoves([]);
    } else if (piece && piece[0] === turn) {
      setSelectedPiece({ row: rowIndex, col: colIndex, piece });
      highlightValidMoves(piece, rowIndex, colIndex);
    }
  };

  const movePiece = (targetRow, targetCol) => {
    const updatedBoard = [...board];
    const { row, col, piece } = selectedPiece;

    updatedBoard[targetRow][targetCol] = piece;
    updatedBoard[row][col] = "";

    setBoard(updatedBoard);
    setSelectedPiece(null);
    setValidMoves([]);
    setTurn(turn === "w" ? "b" : "w");
  };

  const renderPiece = (piece) => {
    if (!piece) return null;
    const [color, type] = piece.split('.');
    return <span className="piece">{pieces[color][type]}</span>;
  };
  
  const createChessboard = () => {
    return board.map((row, rowIndex) => (
      <div className="row" key={rowIndex}>
        {row.map((piece, colIndex) => {
          const isWhite = (rowIndex + colIndex) % 2 === 0;
          const isValidMoveSquare = validMoves.some(move => move.row === rowIndex && move.col === colIndex);
          return (
            <div
              className={`square ${isWhite ? 'white' : 'black'} ${isValidMoveSquare ? 'valid' : ''}`}
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {renderPiece(piece)}
            </div>
          );
        })}
      </div>
    ));
  };
  
  return (
    <div>
      <Header />
      <h1 className="game-title"><b>Chess Game</b></h1>
      <div className="chessboard">
        
        <div className="turn-indicator">Turn: {turn === "w" ? "White" : "Black"}</div>
        {createChessboard()}
      </div>
    </div>
  );
};

export default ChessGame;