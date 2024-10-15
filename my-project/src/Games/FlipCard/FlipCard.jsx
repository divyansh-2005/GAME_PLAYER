import  { useState, useEffect } from "react";
import "./FlipGame.css"; // Import your CSS file for styling
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Back from '../../Components/Back';


const symbols = [
  "😀", "🐶", "🍕", "🚗", "🌟", "🎉", "🏀", "🎸",
  "😀", "🐶", "🍕", "🚗", "🌟", "🎉", "🏀", "🎸"
];

const shuffleArray = (array) => {
  let shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

const FlipGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);

  useEffect(() => {
    if (gameStarted) {
      setCards(shuffleArray(symbols));
      setFlippedIndices([]);
      setMatchedIndices([]);
    }
  }, [gameStarted]);

  const handleCardClick = (index) => {
    if (flippedIndices.length < 2 && !flippedIndices.includes(index) && !matchedIndices.includes(index)) {
      const newFlippedIndices = [...flippedIndices, index];
      setFlippedIndices(newFlippedIndices);

      if (newFlippedIndices.length === 2) {
        const [firstIndex, secondIndex] = newFlippedIndices;
        if (cards[firstIndex] === cards[secondIndex]) {
          setMatchedIndices([...matchedIndices, firstIndex, secondIndex]);
        }
        setTimeout(() => setFlippedIndices([]), 1000);
      }
    }
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
  };

  return (
    <>
    <Header/>
    <Back />
    <div className="flip-game-container">
      {!gameStarted ? (
        <div className="start-screen">
          <h2>Flip Card Game</h2>
          <button className="start-button" onClick={startGame}>Start Game</button>
        </div>
      ) : (
        <div className="flip-game">
          <div className="game-board">
            {cards.map((symbol, index) => (
              <div
                key={index}
                className={`card ${flippedIndices.includes(index) || matchedIndices.includes(index) ? "flipped" : ""}`}
                onClick={() => handleCardClick(index)}
              >
                <div className="flipper">
                  <div className="front"></div>
                  <div className="back">{symbol}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="reset-button" onClick={resetGame}>Reset Game</button>
        </div>
      )}
    </div>
    <Footer/>
    </>
  );
};

export default FlipGame;
