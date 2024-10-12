import React, { useRef, useEffect } from 'react';
import './FlappyBird.css'; // Import your CSS file for styling
import Header from '../../Components/Header'; // Import the Header component
import Footer from '../../Components/Footer'; // Import the Footer component
import imgSrc from './assets/flappy-bird-set.png'; // Import the image from the assets folder

const FlappyBird = () => {
  const canvasRef = useRef(null);
  const img = new Image();
  img.src = imgSrc;

  // General settings
  let gamePlaying = false;
  const gravity = 0.5;
  const speed = 6.2;
  const size = [51, 36];
  const jump = -11.5;
  const cTenth = (431 / 10);

  let index = 0,
      bestScore = 0, 
      flight, 
      flyHeight, 
      currentScore, 
      pipes;

  // Pipe settings
  const pipeWidth = 78;
  const pipeGap = 270;
  const pipeLoc = () => (Math.random() * ((600 - (pipeGap + pipeWidth)) - pipeWidth)) + pipeWidth;

  const setup = (canvasHeight) => {
    currentScore = 0;
    flight = jump;

    // Set initial flyHeight
    flyHeight = (canvasHeight / 2) - (size[1] / 2);

    // Setup first 3 pipes
    pipes = Array(3).fill().map((a, i) => [431 + (i * (pipeGap + pipeWidth)), pipeLoc()]);
  }

  const render = (ctx) => {
    index++;

    // Background rendering
    ctx.drawImage(img, 0, 0, 431, 600, -((index * (speed / 2)) % 431) + 431, 0, 431, 600);
    ctx.drawImage(img, 0, 0, 431, 600, -(index * (speed / 2)) % 431, 0, 431, 600);
    
    // Pipe display
    if (gamePlaying) {
      pipes.map(pipe => {
        // Pipe movement
        pipe[0] -= speed;

        // Top pipe
        ctx.drawImage(img, 432, 588 - pipe[1], pipeWidth, pipe[1], pipe[0], 0, pipeWidth, pipe[1]);
        // Bottom pipe
        ctx.drawImage(img, 432 + pipeWidth, 108, pipeWidth, 600 - pipe[1] + pipeGap, pipe[0], pipe[1] + pipeGap, pipeWidth, 600 - pipe[1] + pipeGap);

        // Score management
        if (pipe[0] <= -pipeWidth) {
          currentScore++;
          bestScore = Math.max(bestScore, currentScore);
          pipes = [...pipes.slice(1), [pipes[pipes.length - 1][0] + pipeGap + pipeWidth, pipeLoc()]];
        }
    
        // Collision detection
        if ([ 
          pipe[0] <= cTenth + size[0], 
          pipe[0] + pipeWidth >= cTenth, 
          pipe[1] > flyHeight || pipe[1] + pipeGap < flyHeight + size[1]
        ].every(elem => elem)) {
          gamePlaying = false;
          setup(600);
        }
      })
    }

    // Draw bird
    if (gamePlaying) {
      ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, cTenth, flyHeight, ...size);
      flight += gravity;
      flyHeight = Math.min(flyHeight + flight, 600 - size[1]);
    } else {
      ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, ((431 / 2) - size[0] / 2), flyHeight, ...size);
      flyHeight = (600 / 2) - (size[1] / 2);
      ctx.fillText(`Best score : ${bestScore}`, 85, 245);
      ctx.fillText('Tap to play', 90, 535); // Updated text to reflect the click/tap action
      ctx.font = "bold 30px courier";
    }

    // Update scores
    document.getElementById('currentScore').innerHTML = `Current : ${currentScore}`;
    document.getElementById('bestScore').innerHTML = `Best : ${bestScore}`;

    // Animation loop
    window.requestAnimationFrame(() => render(ctx));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Launch setup
    setup(600);
    img.onload = () => render(ctx);

    const handleClick = () => {
      if (!gamePlaying) {
        gamePlaying = true; // Start the game on first click
      }
      flight = jump; // Make the bird jump
    };

    // Add mouse click event listener
    canvas.addEventListener('click', handleClick);

    return () => canvas.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
      <Header />
      <div id="game-container">
        <canvas ref={canvasRef} width={431} height={600} />
        <div id="scoreContainer">
          <span id="currentScore"></span>
          <span id="bestScore"></span>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FlappyBird;
