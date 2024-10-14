import { useEffect, useRef, useState } from 'react';
import styles from './App.module.css';
import blueCandy from './images/blue-candy.png';
import greenCandy from './images/green-candy.png';
import orangeCandy from './images/orange-candy.png';
import purpleCandy from './images/purple-candy.png';
import redCandy from './images/red-candy.png';
import yellowCandy from './images/yellow-candy.png';
import blank from './images/blank.png';

const WIDTH = 8;
const candyColors = [blueCandy, orangeCandy, purpleCandy, redCandy, yellowCandy, greenCandy];

const CandyCrush = () => {
  const [candies, setCandies] = useState([]);
  const currentCandies = useRef([]);
  const [candieDragged, setCandieDragged] = useState(null);
  const [candieToReplace, setCandieToReplace] = useState(null);
  const [score, setScore] = useState(0);

  const playSound = (id) => {
    document.getElementById(id)?.play();
  };

  const updateScore = (num) => {
    setScore((prevScore) => prevScore + num);
  };

  const setRowToBlank = (index) => {
    const row = Math.floor(index / WIDTH);
    for (let i = row * WIDTH; i < (row * WIDTH + WIDTH); i++) {
      currentCandies.current[i].color = blank;
      currentCandies.current[i].modifier = '';
    }
    updateScore(WIDTH);
    playSound('line_blast');
  };

  const setColToBlank = (index) => {
    const col = index % WIDTH;
    for (let i = 0; i < WIDTH; i++) {
      currentCandies.current[col + i * WIDTH].color = blank;
      currentCandies.current[col + i * WIDTH].modifier = '';
    }
    updateScore(WIDTH);
    playSound('line_blast');
  };

  const checkForColumns = (num, indexes = null) => {
    for (let i = 0; i <= WIDTH * (WIDTH - num); i++) {
      const columns = Array.from({ length: num }, (_, j) => i + j * WIDTH);
      const decidedColor = currentCandies.current[i].color;
      const isBlank = decidedColor === blank;

      if (columns.every((index) => currentCandies.current[index].color === decidedColor && !isBlank)) {
        updateScore(num);

        let specialCandyIndex = -1;
        if (num > 3) {
          specialCandyIndex = columns.findIndex((col) => indexes?.includes(col));
          if (specialCandyIndex === -1) specialCandyIndex = 0;
          playSound('striped_candy_created');
        }

        columns.forEach((colIndex, j) => {
          if (j === specialCandyIndex) {
            currentCandies.current[colIndex].modifier = 'horizontal';
          } else if (currentCandies.current[colIndex].modifier) {
            if (currentCandies.current[colIndex].modifier === 'vertical') setColToBlank(colIndex);
            if (currentCandies.current[colIndex].modifier === 'horizontal') setRowToBlank(colIndex);
          } else {
            currentCandies.current[colIndex].color = blank;
            currentCandies.current[colIndex].modifier = '';
          }
        });

        return true;
      }
    }
    return false;
  };

  const checkForRows = (num, indexes = null) => {
    for (let i = 0; i < WIDTH * WIDTH; i++) {
      const rowEnd = i + num;
      if (i % WIDTH > WIDTH - num) continue;

      const rows = Array.from({ length: num }, (_, j) => i + j);
      const decidedColor = currentCandies.current[i].color;
      const isBlank = decidedColor === blank;

      if (rows.every((index) => currentCandies.current[index].color === decidedColor && !isBlank)) {
        updateScore(num);

        let specialCandyIndex = -1;
        if (num > 3) {
          specialCandyIndex = rows.findIndex((row) => indexes?.includes(row));
          if (specialCandyIndex === -1) specialCandyIndex = 0;
          playSound('striped_candy_created');
        }

        rows.forEach((rowIndex, j) => {
          if (j === specialCandyIndex) {
            currentCandies.current[rowIndex].modifier = 'vertical';
          } else if (currentCandies.current[rowIndex].modifier) {
            if (currentCandies.current[rowIndex].modifier === 'vertical') setColToBlank(rowIndex);
            if (currentCandies.current[rowIndex].modifier === 'horizontal') setRowToBlank(rowIndex);
          } else {
            currentCandies.current[rowIndex].color = blank;
            currentCandies.current[rowIndex].modifier = '';
          }
        });

        return true;
      }
    }
    return false;
  };

  const moveIntoSquareBelow = () => {
    for (let i = 0; i < WIDTH * (WIDTH - 1); i++) {
      if (currentCandies.current[i + WIDTH].color === blank) {
        currentCandies.current[i + WIDTH].color = currentCandies.current[i].color;
        currentCandies.current[i + WIDTH].modifier = currentCandies.current[i].modifier;
        currentCandies.current[i].color = blank;
        currentCandies.current[i].modifier = '';
      }
    }

    for (let i = 0; i < WIDTH; i++) {
      if (currentCandies.current[i].color === blank) {
        const randomColor = candyColors[Math.floor(Math.random() * candyColors.length)];
        currentCandies.current[i].color = randomColor;
        currentCandies.current[i].modifier = '';
      }
    }
  };

  const dragStart = (e) => setCandieDragged(e.target);
  const dragDrop = (e) => setCandieToReplace(e.target);
  
  const dragEnd = () => {
    const dragIndex = parseInt(candieDragged.getAttribute('data-index'));
    const replaceIndex = parseInt(candieToReplace.getAttribute('data-index'));
    const validMoves = [dragIndex - 1, dragIndex - WIDTH, dragIndex + 1, dragIndex + WIDTH];

    if (!validMoves.includes(replaceIndex)) return;

    const draggedColor = candieDragged.getAttribute('data-src');
    const replaceColor = candieToReplace.getAttribute('data-src');
    const draggedModifier = candieDragged.getAttribute('data-modifier');
    const replaceModifier = candieToReplace.getAttribute('data-modifier');

    currentCandies.current[dragIndex].color = replaceColor;
    currentCandies.current[replaceIndex].color = draggedColor;
    currentCandies.current[dragIndex].modifier = replaceModifier;
    currentCandies.current[replaceIndex].modifier = draggedModifier;

    const isAColumnOfFour = checkForColumns(4, [dragIndex, replaceIndex]);
    const isARowOfFour = checkForRows(4, [dragIndex, replaceIndex]);
    const isAColumnOfThree = checkForColumns(3, [dragIndex, replaceIndex]);
    const isARowOfThree = checkForRows(3, [dragIndex, replaceIndex]);

    if (!(isARowOfThree || isARowOfFour || isAColumnOfThree || isAColumnOfFour)) {
      currentCandies.current[dragIndex].color = draggedColor;
      currentCandies.current[replaceIndex].color = replaceColor;
      currentCandies.current[dragIndex].modifier = draggedModifier;
      currentCandies.current[replaceIndex].modifier = replaceModifier;
      playSound('negative_switch');
    }

    setCandieDragged(null);
    setCandieToReplace(null);
  };

  const createBoard = () => {
    const randomCandies = Array.from({ length: WIDTH * WIDTH }, () => ({
      color: candyColors[Math.floor(Math.random() * candyColors.length)],
      modifier: '',
    }));
    setCandies(randomCandies);
    currentCandies.current = randomCandies;
  };

  useEffect(() => {
    createBoard();
    
    // Wait for a brief moment before starting to check for matches.
    const timer = setTimeout(() => {
        const interval = setInterval(() => {
            checkForColumns(4);
            checkForRows(4);
            checkForColumns(3);
            checkForRows(3);
            moveIntoSquareBelow();
            setCandies([...currentCandies.current]);
        }, 100);

        // Store the interval ID in a ref to clear it later if needed
        currentCandies.current.intervalId = interval;
    }, 500); // Adjust the delay as needed (e.g., 500ms)

    // Clear interval and timer on unmount
    return () => {
        clearTimeout(timer);
        clearInterval(currentCandies.current.intervalId);
    };
}, []);


  return (
    <div className={styles.app}>
      <div className={styles['score-board']}>
        <span>Score: </span><b>{score}</b>
      </div>
      <div className={styles.game}>
        {candies.map(({ color, modifier }, index) => (
          <div
            key={index}
            className={`${styles['img-container']} ${(color !== blank && modifier) ? styles[modifier] : ''}`}
            data-src={color}
            data-index={index}
            data-modifier={modifier}
            draggable={true}
            onDragStart={dragStart}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.preventDefault()}
            onDragLeave={(e) => e.preventDefault()}
            onDrop={dragDrop}
            onDragEnd={dragEnd}
          >
            <img src={color} alt="candy" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandyCrush;
