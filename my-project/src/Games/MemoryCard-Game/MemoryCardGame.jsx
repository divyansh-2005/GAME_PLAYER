import React, { useState, useEffect } from 'react';
import './MemoryCardGame.css'; // Custom CSS for styling
import Header from '../../Components/Header';

const cardImages = [
  { id: 1, img: '🍎' },
  { id: 2, img: '🍌' },
  { id: 3, img: '🍉' },
  { id: 4, img: '🍇' },
  { id: 5, img: '🍓' },
  { id: 6, img: '🍍' },
];

// Duplicate and shuffle cards
const shuffleCards = () => {
  const shuffledCards = [...cardImages, ...cardImages]
    .sort(() => Math.random() - 0.5)
    .map((card) => ({ ...card, isFlipped: false, id: Math.random() }));
  return shuffledCards;
};

const MemoryCardGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [turns, setTurns] = useState(0);

  // Shuffle cards when the component mounts
  useEffect(() => {
    setCards(shuffleCards());
  }, []);

  // Handle a card being clicked
  const handleCardClick = (index) => {
    if (flippedCards.length === 2 || matchedCards.includes(index)) return;

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setTurns(turns + 1);
      setTimeout(() => checkMatch(newFlippedCards), 1000);
    }
  };

  // Check if two flipped cards are a match
  const checkMatch = (newFlippedCards) => {
    const [firstIndex, secondIndex] = newFlippedCards;
    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];

    if (firstCard.img === secondCard.img) {
      setMatchedCards([...matchedCards, firstIndex, secondIndex]);
    }

    setFlippedCards([]);
  };

  // Reset the game
  const resetGame = () => {
    setCards(shuffleCards());
    setFlippedCards([]);
    setMatchedCards([]);
    setTurns(0);
  };

  return (

    <div>
        <Header/>
        <div className="game-container">
      <h1>Memory Card Game</h1>
      <div className="turns">Turns: {turns}</div>

      <div className="grid">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`card ${flippedCards.includes(index) || matchedCards.includes(index) ? 'flipped' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="inner-card">
              <div className="card-front">?</div>
              <div className="card-back">{card.img}</div>
            </div>
          </div>
        ))}
      </div>

      {matchedCards.length === cards.length && (
        <div className="victory">
          <h2>Congratulations! You won the game in {turns} turns.</h2>
          <button onClick={resetGame}>
            <h2>Play Again</h2>
          </button>
        </div>
      )}
    </div>
    </div>
  );
};

export default MemoryCardGame;