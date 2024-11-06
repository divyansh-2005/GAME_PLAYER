/** @format */

import { useState, useEffect } from "react";
import "./EmojiIntruder.css";
import Footer from "../../Components/Footer";
import Header from "../../Components/Header";
import Back from "../../Components/Back";

const EmojiIntruderHunt = () => {
  const [gridItems, setGridItems] = useState([]);
  const [oddOneOutIndex, setOddOneOutIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerId, setTimerId] = useState(null);
  const [resultMessage, setResultMessage] = useState("");
  const [instruction, setInstruction] = useState('Click "Start" to play!');
  const [disabled, setDisabled] = useState(true);

  const emojisList = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "😭",
    "😢",
  ];

  useEffect(() => {
    generateRandomGrid();
  }, []);

  const generateRandomGrid = () => {
    const randomIndex = Math.floor(Math.random() * emojisList.length);
    const randomOddOneOutIndex = Math.floor(Math.random() * 63);

    let items = Array.from({ length: 63 }, (_, index) => {
      return index === randomOddOneOutIndex
        ? emojisList[randomIndex]
        : emojisList[randomIndex];
    });

    if (
      items.every(
        (emoji, index) =>
          emoji === items[randomOddOneOutIndex] ||
          index === randomOddOneOutIndex
      )
    ) {
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
    setResultMessage("");
    setInstruction("Find the odd one out among the emojis.");

    const emojiButtons = document.querySelectorAll(".emoji-button");
    emojiButtons.forEach((button) => {
      button.classList.remove("highlight");
    });

    generateRandomGrid();
  };

  const updateTime = () => {
    setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
    if (timeLeft <= 0) {
      clearInterval(timerId);
      setDisabled(true);

      const oddEmojiButton = document.querySelector(
        `[data-index="${oddOneOutIndex}"]`
      );
      if (oddEmojiButton) {
        oddEmojiButton.classList.add("highlight");
      }

      setInstruction('Time\'s up! Click "Start" to play again.');
    }
  };

  const checkEmoji = (event) => {
    if (event.target.classList.contains("emoji-button")) {
      const clickedIndex = parseInt(event.target.dataset.index);
      if (clickedIndex === oddOneOutIndex) {
        setResultMessage("Correct! You found the odd one out!");
      } else {
        setResultMessage("Wrong! Keep looking!");
      }

      clearInterval(timerId);
      setDisabled(true);

      const oddEmojiButton = document.querySelector(
        `[data-index="${oddOneOutIndex}"]`
      );
      if (oddEmojiButton) {
        oddEmojiButton.classList.add("highlight");
      }

      setInstruction('Click "Start" to play again.');
    }
  };

  return (
    <>
      <Header />
      <Back />
      <div className="emoji-intruder-hunt p-5 flex">
        <div className="left-side flex flex-col justify-between mr-10 max-w-md w-5/6 mx-auto">
          <h1 className="emoji-heading text-5xl text-orange-300 mb-5 shadow-md">
            Emoji Intruder Hunt
          </h1>
          <div
            id="timer"
            className="text-2xl text-white bg-orange-600 py-3 px-5 rounded shadow-md mb-5"
          >
            Time left: <span id="timeLeft">{timeLeft}</span>s
          </div>
          <button
            id="startButton"
            className="px-6 py-4 text-2xl bg-orange-600 text-white rounded-lg transition-transform duration-300 transform hover:bg-orange-700 hover:scale-105"
            onClick={startGame}
          >
            Start
          </button>
          <div
            className="instruction border-l-4 border-orange-500 text-xl my-4 p-4 rounded-md shadow-md"
            id="instruction"
          >
            {instruction}
          </div>
          <div
            id="result"
            className=" border-l-4 border-blue-500 text-xl font-bold text-blue-500 mt-4 p-4 rounded-md shadow-md"
          >
            {resultMessage}
          </div>
        </div>
        <div
          id="gridContainer"
          className={`grid gap-4 mx-auto max-w-4xl ${
            disabled ? "pointer-events-none" : ""
          }`}
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
          }}
        >
          {gridItems.map((emoji, index) => (
            <button
              key={index}
              className={`emoji-button text-5xl p-4 bg-yellow-300 border-2 border-white rounded-lg transition-transform duration-300 transform hover:bg-yellow-400 ${
                index === oddOneOutIndex ? "odd" : ""
              }`}
              data-index={index}
              onClick={checkEmoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EmojiIntruderHunt;
