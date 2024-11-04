import { useState } from 'react';
import './Battleship.css';
import Header from "../../Components/Header";

const Battleship = () => {
    const [playerTurn, setPlayerTurn] = useState(1);
    const [board1, setBoard1] = useState(Array(10).fill(null).map(() => Array(10).fill(null))); // Player 1's board
    const [board2, setBoard2] = useState(Array(10).fill(null).map(() => Array(10).fill(null))); // Player 2's board
    const [score, setScore] = useState({ player1: 0, player2: 0 });

    const ships = [
        { size: 2, points: 1 },
        { size: 3, points: 2 },
        { size: 4, points: 3 },
        { size: 3, points: 2 },
        { size: 5, points: 4 }
    ];

    const placeShips = (board) => {
        // Logic to place ships randomly on the board (not implemented here)
        return board;
    };

    // Place ships on the boards
    const initializedBoard1 = placeShips(board1);
    const initializedBoard2 = placeShips(board2);

    const handleCellClick = (row, col) => {
        let newBoard, newScore = { ...score };

        if (playerTurn === 1) {
            newBoard = board2.map((r, i) => 
                r.map((cell, j) => {
                    if (i === row && j === col) {
                        if (cell === null) {
                            const hit = checkHit(initializedBoard2, row, col);
                            if (hit) {
                                newScore.player1 += 1; // Increment score for hit
                                return 'hit';
                            } else {
                                return 'miss';
                            }
                        }
                        return cell;
                    }
                    return cell;
                })
            );
            setBoard2(newBoard);
        } else {
            newBoard = board1.map((r, i) => 
                r.map((cell, j) => {
                    if (i === row && j === col) {
                        if (cell === null) {
                            const hit = checkHit(initializedBoard1, row, col);
                            if (hit) {
                                newScore.player2 += 1; // Increment score for hit
                                return 'hit';
                            } else {
                                return 'miss';
                            }
                        }
                        return cell;
                    }
                    return cell;
                })
            );
            setBoard1(newBoard);
        }
        setScore(newScore);
        toggleTurn();
    };

    const checkHit = (board, row, col) => {
        return board[row][col] !== null; 
    };

    const toggleTurn = () => {
        setPlayerTurn((prevTurn) => (prevTurn === 1 ? 2 : 1));
    };

    return (
        <>
            <Header style={{ marginBottom: "20px" }} />
            <div className="battleship-game">
                <h1>Battleship</h1>
                <div className="boards">
                    <div className="board-container">
                        <h2 className="board-title">Player Board 1</h2>
                        <div className={`board ${playerTurn === 1 ? 'active-board' : ''}`}>
                            {board1.map((row, rowIndex) => (
                                <div className="board-row" key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                        <div 
                                            className={`cell ${cell === 'hit' ? 'hit' : cell === 'miss' ? 'miss' : ''}`} 
                                            key={colIndex} 
                                            onClick={() => handleCellClick(rowIndex, colIndex)}
                                        >
                                            <span>{cell === 'hit' ? 'H' : cell === 'miss' ? 'M' : ''}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="board-container">
                        <h2 className="board-title">Player Board 2</h2>
                        <div className={`board ${playerTurn === 2 ? 'active-board' : ''}`}>
                            {board2.map((row, rowIndex) => (
                                <div className="board-row" key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                        <div 
                                            className={`cell ${cell === 'hit' ? 'hit' : cell === 'miss' ? 'miss' : ''}`} 
                                            key={colIndex} 
                                            onClick={() => handleCellClick(rowIndex, colIndex)}
                                        >
                                            <span>{cell === 'hit' ? 'H' : cell === 'miss' ? 'M' : ''}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={toggleTurn}>End Turn</button>
                <div className="scoreboard">
                    <p>Player 1 Score: {score.player1}</p>
                    <p>Player 2 Score: {score.player2}</p>
                    <p>Current Turn: Player {playerTurn}</p>
                </div>
            </div>
        </>
    );
};

export default Battleship;