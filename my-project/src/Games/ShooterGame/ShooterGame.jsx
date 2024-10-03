import React, { useEffect, useState, useRef } from 'react';
import './ShooterGame.css';

const ShooterGame = () => {
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(5);
    const [wave, setWave] = useState(1);
    const [isGameOver, setIsGameOver] = useState(false);
    const [spawnTime, setSpawnTime] = useState(2000);
    const gameAreaRef = useRef(null);
    const gameIntervalRef = useRef(null);

    const startGame = () => {
        resetGame();
        setIsGameOver(false);
        gameAreaRef.current.classList.remove('hidden');
        spawnEnemy();
        gameIntervalRef.current = setInterval(spawnEnemy, spawnTime);
    };

    const resetGame = () => {
        setScore(0);
        setHealth(5);
        setWave(1);
        setSpawnTime(2000);
    };

    const spawnEnemy = () => {
        const enemy = document.createElement('div');
        enemy.classList.add('enemy');

        const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
        const x = Math.random() * (gameAreaRect.width - 40);
        const y = Math.random() * (gameAreaRect.height - 40);

        enemy.style.left = `${x}px`;
        enemy.style.top = `${y}px`;

        gameAreaRef.current.appendChild(enemy);

        enemy.addEventListener('click', () => handleEnemyClick(enemy));

        setTimeout(() => {
            if (gameAreaRef.current.contains(enemy)) {
                enemy.remove();
                loseHealth();
            }
        }, spawnTime - 500);
    };

    const handleEnemyClick = (enemy) => {
        setScore((prevScore) => prevScore + 1);
        enemy.remove();
        checkWave();
    };

    const loseHealth = () => {
        setHealth((prevHealth) => {
            if (prevHealth <= 1) {
                handleGameOver();
                return 0;
            }
            return prevHealth - 1;
        });
    };

    const checkWave = () => {
        if (score % 5 === 0) {
            setWave((prevWave) => prevWave + 1);
            clearInterval(gameIntervalRef.current);
            setSpawnTime((prevSpawnTime) => Math.max(500, prevSpawnTime - 200));
            gameIntervalRef.current = setInterval(spawnEnemy, spawnTime);
        }
    };

    const handleGameOver = () => {
        clearInterval(gameIntervalRef.current);
        setIsGameOver(true);
    };

    const restartGame = () => {
        gameAreaRef.current.innerHTML = '';
        startGame();
    };

    useEffect(() => {
        return () => clearInterval(gameIntervalRef.current); // Cleanup on unmount
    }, []);

    return (
        <div id="game-container">
            <header>
                <h1>Click Defender</h1>
            </header>
            <main>
                <div id="game-controls">
                    <button id="start-btn" className="btn" onClick={startGame}>Start Game</button>
                </div>
                <div id="game-stats">
                    <div id="score">Score: <span>{score}</span></div>
                    <div id="health">Health: <span>{health}</span></div>
                    <div id="wave">Wave: <span>{wave}</span></div>
                </div>
                <div id="game-area" ref={gameAreaRef}></div>
                {isGameOver && (
                    <div id="game-over">
                        <h2>Game Over</h2>
                        <p>Your final score: <span id="final-score">{score}</span></p>
                        <button id="restart-btn" className="btn" onClick={restartGame}>Restart</button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ShooterGame;
