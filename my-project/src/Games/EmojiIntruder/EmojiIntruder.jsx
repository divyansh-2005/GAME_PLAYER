import  { useState, useEffect } from 'react';
import './EmojiIntruder.css'
import Footer from '../../Components/Footer';
import Header from '../../Components/Header';

const EmojiIntruderHunt = () => {
  const [gridItems, setGridItems] = useState([]);
  const [oddOneOutIndex, setOddOneOutIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerId, setTimerId] = useState(null);
  const [resultMessage, setResultMessage] = useState('');
  const [instruction, setInstruction] = useState('Click "Start" to play!');
  const [disabled, setDisabled] = useState(true);

  const emojisList = [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "😭", "😢"
  ];

  useEffect(() => {
    generateRandomGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateRandomGrid = () => {
    const randomIndex = Math.floor(Math.random() * emojisList.length);
    const randomOddOneOutIndex = Math.floor(Math.random() * 63); // 7 columns * 9 rows = 63 cells

    let items = Array.from({ length: 63 }, (_, index) => {
      return index === randomOddOneOutIndex ? emojisList[randomIndex] : emojisList[randomIndex];
    });

    // Ensure there is at least one different emoji
    if (items.every((emoji, index) => emoji === items[randomOddOneOutIndex] || index === randomOddOneOutIndex)) {
      const newRandomIndex = (randomIndex + 1) % emojisList.length;
      const randomCell = Math.floor(Math.random() * 63);
      items[randomCell] = emojisList[newRandomIndex];
      setOddOneOutIndex(randomCell);
    }

    setGridItems(items);
  };

  const startGame = () => {
    clearInterval(timerId);
    setTimeLeft(20);
    const id = setInterval(updateTime, 1000);
    setTimerId(id);

    setDisabled(false);
    setResultMessage('');
    setInstruction('Find the odd one out among the emojis.');

    // Remove 'highlight' class from all emoji buttons before generating the grid
    const emojiButtons = document.querySelectorAll('.emoji-button');
    emojiButtons.forEach(button => {
      button.classList.remove('highlight');
    });

    generateRandomGrid();
  };

  const updateTime = () => {
    setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
    if (timeLeft <= 0) {
      clearInterval(timerId);
      setDisabled(true);

      // Highlight the odd emoji after time runs out
      const oddEmojiButton = document.querySelector(`[data-index="${oddOneOutIndex}"]`);
      if (oddEmojiButton) {
        oddEmojiButton.classList.add('highlight');
      }

      setInstruction('Time\'s up! Click "Start" to play again.');
    }
  };

  const checkEmoji = (event) => {
    if (event.target.classList.contains('emoji-button')) {
      const clickedIndex = parseInt(event.target.dataset.index);
      if (clickedIndex === oddOneOutIndex) {
        setResultMessage('Correct! You found the odd one out!');
      } else {
        setResultMessage('Wrong! Keep looking!');
      }

      clearInterval(timerId);
      setDisabled(true);

      // Highlight the odd emoji after player's selection
      const oddEmojiButton = document.querySelector(`[data-index="${oddOneOutIndex}"]`);
      if (oddEmojiButton) {
        oddEmojiButton.classList.add('highlight');
      }

      setInstruction('Click "Start" to play again.');
    }
  };

  return (
    <>
    <Header/>
    <div className="emoji-intruder-hunt">
      <div className="header">
        <h1 style={{fontSize:'25px'}}>Emoji Intruder Hunt</h1>
        <div id="timer" style={{fontSize:'20px',color:'white'}}>Time left: <span id="timeLeft">{timeLeft}</span>s</div>
      </div>
      <div id="gridContainer" className={disabled ? 'disabled' : ''}>
        {gridItems.map((emoji, index) => (
          <button key={index} className={`emoji-button ${index === oddOneOutIndex ? 'odd' : ''}`} data-index={index} onClick={checkEmoji}>{emoji}</button>
        ))}
      </div>
      <div className="instruction" id="instruction">{instruction}</div>
      <button id="startButton" onClick={startGame}>Start</button>
      <div id="result">{resultMessage}</div>
    </div>
    <Footer />
    </>
  );
};

export default EmojiIntruderHunt;
