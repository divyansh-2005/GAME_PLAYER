// Board.jsx
import React, { useState, useEffect } from "react";
import './Board.css';


const Board = () => {
    const [columns, setColumns] = useState(Array(7).fill([]));
    const [currentPlayer, setCurrentPlayer] = useState(1); // 1 or 2 for players
    const [winner, setWinner] = useState(null);

    // Handle chip drop
    const handleColumnClick = (columnIndex) => {
        if (winner) return; // No interaction after a winner

        const newColumns = [...columns];
        if (newColumns[columnIndex].length < 6) {
            newColumns[columnIndex] = [...newColumns[columnIndex], currentPlayer];
            setColumns(newColumns);
            checkWinner(newColumns);
            setCurrentPlayer(currentPlayer === 1 ? 2 : 1); // Toggle player
        }
    };

    // Check for a winner after each move
    const checkWinner = (columns) => {
        // Implement game logic for checking winner (horizontal, vertical, diagonal)
        // This is placeholder logic
        if (columns.some(col => col.length === 6)) {
            setWinner(currentPlayer);
        }
    };

    // Reset Game
    const resetGame = () => {
        setColumns(Array(7).fill([]));
        setCurrentPlayer(1);
        setWinner(null);
    };

    return (
        <div className="heading">
            <div className="wrapper">
                <div className="content">
                    <div className="sidebar">
                        <h1>{winner ? `Player ${winner} Wins!` : `Player ${currentPlayer}'s Turn`}</h1>
                        <div className="panel">
                            <button onClick={resetGame}>Restart Game</button>
                        </div>
                    </div>
                    <div className="boardalign">
                        <div className="click-columns">
                            {columns.map((column, i) => (
                                <div key={i} onClick={() => handleColumnClick(i)} className="hover">
                                    <div className="column">
                                        {column.map((chip, j) => (
                                            <div
                                                key={j}
                                                className={`chip ${chip === 1 ? "p1" : "p2"} dropped`}
                                                style={{ bottom: `${(5 - j) * 60}px` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Board;
