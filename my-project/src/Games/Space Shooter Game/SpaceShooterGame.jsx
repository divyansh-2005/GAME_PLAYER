import React, { useEffect, useRef, useState } from "react";
import "./style.css"; // Importing CSS for styling
import rocket from './Images/rocket.png';
import bomb from './Images/bomb.png';
import explosionImg from './Images/explosion.png';

const SpaceShooterGame = () => {
    const gameAreaRef = useRef(null);
    const playerRef = useRef(null);
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [showStartModal, setShowStartModal] = useState(true);
    const [showGameOverModal, setShowGameOverModal] = useState(false);
    const bulletsRef = useRef([]);
    const enemiesRef = useRef([]);
    const playerXRef = useRef(0);
    const canShootRef = useRef(true); // For bullet cooldown
    const enemyCreationIntervalRef = useRef(null); // To keep track of enemy creation interval

    useEffect(() => {
        playerXRef.current = gameAreaRef.current.offsetWidth / 2; // Initialize player position
    }, []);

    const startGame = () => {
        setShowStartModal(false);
        playerXRef.current = gameAreaRef.current.offsetWidth / 2; // Reset player position
        setScore(0); // Reset score
        setIsGameOver(false); // Reset game state
        bulletsRef.current = []; // Clear bullets
        enemiesRef.current = []; // Clear enemies

        // Remove all existing enemies from the DOM
        const existingEnemies = document.querySelectorAll(".enemy");
        existingEnemies.forEach((enemy) => enemy.remove());

        // Start spawning enemies
        enemyCreationIntervalRef.current = setInterval(() => {
            if (isGameOver) {
                clearInterval(enemyCreationIntervalRef.current);
            } else {
                createEnemy();
            }
        }, 1000);
    };

    const movePlayer = (direction) => {
        let playerX = playerXRef.current + direction;
        // Prevent the player from moving out of bounds
        if (playerX < 40) playerX = 40;
        if (playerX > gameAreaRef.current.offsetWidth - 50)
            playerX = gameAreaRef.current.offsetWidth - 50;
        playerRef.current.style.left = playerX + "px";
        playerXRef.current = playerX;
    };

    const shootBullet = () => {
        if (!canShootRef.current) return; // Prevent shooting if on cooldown

        canShootRef.current = false;
        setTimeout(() => {
            canShootRef.current = true;
        }, 300); // 300ms cooldown between shots

        const bullet = document.createElement("div");
        bullet.classList.add("bullet");
        bullet.style.left = playerXRef.current + "px";
        bullet.style.bottom = "80px";
        gameAreaRef.current.appendChild(bullet);
        bulletsRef.current.push(bullet);

        const bulletInterval = setInterval(() => {
            let bulletY = bullet.offsetTop;
            bulletY -= 10;
            bullet.style.top = bulletY + "px";

            // Check for collision
            checkCollision(bullet, bulletInterval);

            // Remove if off-screen
            if (bulletY < 0) {
                clearInterval(bulletInterval);
                bullet.remove();
                bulletsRef.current.shift();
            }
        }, 20);
    };

    const createEnemy = () => {
        const enemy = document.createElement("div");
        enemy.classList.add("enemy");
        enemy.style.backgroundImage = `url(${bomb})`;
        enemy.style.backgroundSize = "cover";
        enemy.style.left = Math.random() * (gameAreaRef.current.offsetWidth - 60) + "px";
        gameAreaRef.current.appendChild(enemy);
        enemiesRef.current.push(enemy);

        const enemyInterval = setInterval(() => {
            let enemyY = enemy.offsetTop;
            enemyY += 5;
            enemy.style.top = enemyY + "px";

            // Check for collision with player
            checkPlayerCollision(enemy, enemyInterval);

            // Remove enemy if off-screen
            if (enemyY > gameAreaRef.current.offsetHeight) {
                clearInterval(enemyInterval);
                enemy.remove();
                enemiesRef.current.shift();
            }
        }, 150);
    };

    const checkCollision = (bullet, bulletInterval) => {
        const bulletRect = bullet.getBoundingClientRect();
        enemiesRef.current.forEach((enemy, index) => {
            const enemyRect = enemy.getBoundingClientRect();
            if (
                bulletRect.left < enemyRect.right &&
                bulletRect.right > enemyRect.left &&
                bulletRect.top < enemyRect.bottom &&
                bulletRect.bottom > enemyRect.top
            ) {
                setScore((prevScore) => prevScore + 1);
                clearInterval(bulletInterval);
                bullet.remove();

                // Play explosion animation
                enemy.style.backgroundImage = `url(${explosionImg})`;
                enemy.classList.add('explosion');
                setTimeout(() => enemy.remove(), 500); // Remove after explosion
                enemiesRef.current.splice(index, 1);
            }
        });
    };

    const checkPlayerCollision = (enemy, enemyInterval) => {
        const playerRect = playerRef.current.getBoundingClientRect();
        const enemyRect = enemy.getBoundingClientRect();
        if (
            playerRect.left < enemyRect.right &&
            playerRect.right > enemyRect.left &&
            playerRect.top < enemyRect.bottom &&
            playerRect.bottom > enemyRect.top
        ) {
            setIsGameOver(true);
            setShowGameOverModal(true);
            clearInterval(enemyInterval);
            enemiesRef.current.forEach((enemy) => enemy.remove());
            enemiesRef.current = [];
            clearInterval(enemyCreationIntervalRef.current); // Stop creating new enemies
        }
    };

    const handleRestart = () => {
        setShowGameOverModal(false);
        window.location.reload();
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (isGameOver) return;
            if (event.code === "ArrowLeft") {
                movePlayer(-20);
            } else if (event.code === "ArrowRight") {
                movePlayer(20);
            } else if (event.code === "Space") {
                shootBullet();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            clearInterval(enemyCreationIntervalRef.current); // Clean up interval on unmount
        };
    }, [isGameOver]);

    return (
        <div className="game-container w-full h-full">
            <h1 className="text-2xl mb-4 rounded-md w-full ">Space Shooter Game</h1>
            <div id="gameArea" ref={gameAreaRef} className="pb-4">
                <div id="scoreBoard" className="text-2xl my-4 rounded-full text-white  ">Score: {score}</div>
                <div id="player" ref={playerRef}>
                    <img src={rocket} alt="rocket" width="50" height="80" />
                </div>
            </div>
            {showStartModal && (
                <div id="startModal" className="modal show"> {/* Add 'show' class */}
                    <div className="modal-content">
                        <h1 className="bg-transparent text-black">Start Game</h1>
                        <button onClick={startGame} className="text-white bg-green-500 hover:bg-green-700">Start</button>
                    </div>
                </div>
            )}

            {showGameOverModal && (
                <div id="gameOverModal" className="modal show"> {/* Add 'show' class */}
                    <div className="modal-content">
                        <h1 className="bg-transparent text-black">Game Over</h1>
                        <p className="text-black text-xl">Score: {score}</p>
                        <button onClick={handleRestart} className="text-white bg-green-500 hover:bg-green-700 py-2 button">Restart</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpaceShooterGame;