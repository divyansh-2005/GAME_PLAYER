import React, { useState, useEffect } from 'react';
import './Crossword.css';
import Header from '../../Components/Header';


const initialGrid = [
  ['C', 'A', 'T', 'D', 'O', 'G', 'F', 'X'],
  ['A', 'H', 'Q', 'B', 'E', 'D', 'T', 'Y'],
  ['R', 'O', 'U', 'S', 'E', 'N', 'W', 'Z'],
  ['I', 'C', 'U', 'M', 'O', 'U', 'S', 'E'],
  ['D', 'E', 'S', 'O', 'H', 'N', 'E', 'P'],
  ['G', 'N', 'P', 'F', 'I', 'S', 'H', 'O'],
  ['M', 'R', 'U', 'B', 'I', 'R', 'D', 'D'],
  ['P', 'C', 'F', 'A', 'B', 'C', 'K', 'L'],
];

// Sample words to find
const words = ['CAT', 'DOG', 'FISH', 'BIRD', 'MOUSE'];

const Crossword = () => {
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [foundWords, setFoundWords] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !gameWon && !gameLost) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setGameLost(true);
    }
  }, [timeLeft, gameWon, gameLost]);

  const toggleCell = (row, col) => {
    const cellKey = `${row}-${col}`;
    const newSelectedCells = new Set(selectedCells);

    if (newSelectedCells.has(cellKey)) {
      newSelectedCells.delete(cellKey);
    } else {
      newSelectedCells.add(cellKey);
    }
    setSelectedCells(newSelectedCells);
  };

  const checkWord = (word) => {
    const wordCells = [];
    for (let y = 0; y < initialGrid.length; y++) {
      for (let x = 0; x < initialGrid[y].length; x++) {
        if (initialGrid[y][x] === word[0]) {
          const directions = [
            { dx: 1, dy: 0 },  // Horizontal
            { dx: 0, dy: 1 },  // Vertical
            { dx: 1, dy: 1 },  // Diagonal down-right
            { dx: 1, dy: -1 }  // Diagonal down-left
          ];
          directions.forEach(({ dx, dy }) => {
            const cells = [];
            let fits = true;
            for (let index = 0; index < word.length; index++) {
              const newX = x + index * dx;
              const newY = y + index * dy;
              if (
                newX >= 0 && newY >= 0 &&
                newX < initialGrid.length && newY < initialGrid[0].length &&
                initialGrid[newY][newX] === word[index]
              ) {
                cells.push(`${newY}-${newX}`);
              } else {
                fits = false;
                break;
              }
            }
            if (fits) wordCells.push(...cells);
          });
        }
      }
    }
    return wordCells;
  };

  const checkSelectedCells = () => {
    const matchedWords = new Set();
    
    words.forEach(word => {
      const matchedCells = checkWord(word);
      const isFound = matchedCells.every(cell => selectedCells.has(cell));
      if (isFound) {
        matchedWords.add(word);
        matchedCells.forEach(cell => {
          setFoundWords(prev => new Set([...prev, word]));
        });
      }
    });

    if (matchedWords.size === words.length) {
      setGameWon(true);
    }
  };

  const getCellClass = (row, col) => {
    const cellKey = `${row}-${col}`;
    let cellClass = '';

    if (selectedCells.has(cellKey)) {
      let correct = false;

      words.forEach(word => {
        const matchedCells = checkWord(word);
        if (matchedCells.includes(cellKey) && foundWords.has(word)) {
          correct = true;
        }
      });

      cellClass = correct ? 'correct' : 'highlighted';
    } else if (foundWords.size > 0) {
      words.forEach(word => {
        const matchedCells = checkWord(word);
        if (matchedCells.includes(cellKey) && foundWords.has(word)) {
          cellClass = 'correct';
        }
      });
    }

    return cellClass;
  };

  const handlePlayAgain = () => {
    setSelectedCells(new Set());
    setFoundWords(new Set());
    setTimeLeft(90);
    setGameWon(false);
    setGameLost(false);
  };

  return (
    <>

    <Header style={{ marginBottom: '20px' }} />
        
    
    <div className="crossword">
         
      <h2 className="neon-title">CROSSWORD GAME</h2>
      <div className="timer">Time Left: {timeLeft}s</div>
      
      <div className="crossword-container">
        <div className="result-message-container">
          {gameWon && (
            <div className="result-message neon">
              <h2>Congratulations, You Won!</h2>
              <button onClick={handlePlayAgain}>Play Again</button>
            </div>
          )}
          {gameLost && (
            <div className="result-message neon">
              <h2>Sorry, You Lost!</h2>
              <button onClick={handlePlayAgain}>Play Again</button>
            </div>
          )}
        </div>
        
        <div className="grid">
          {initialGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="crossword-row">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`crossword-cell ${getCellClass(rowIndex, colIndex)}`}
                  onClick={() => {
                    toggleCell(rowIndex, colIndex);
                    checkSelectedCells();
                  }}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
  
        <div className="word-list">
          <h3>WORD LIST:</h3>
          <ul>
            {words.map((word, index) => (
              <li key={index} style={{ textDecoration: foundWords.has(word) ? 'line-through' : 'none' }}>
                {word}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </>
  );
 
};


export default Crossword;