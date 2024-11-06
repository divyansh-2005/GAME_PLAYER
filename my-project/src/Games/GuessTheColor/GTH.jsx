/** @format */

import { useState, useEffect, useCallback } from "react";

import { generateRandomColors, chooseColor } from "./colorUtils";
import "./style.css";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Back from "../../Components/Back";

const GTH = () => {
  const [colors, setColors] = useState([]);
  const [pickedColor, setPickedColor] = useState("");
  const [message, setMessage] = useState("");
  const [numSquares, setNumSquares] = useState(6);

  const resetGame = useCallback(() => {
    const newColors = generateRandomColors(numSquares);
    const newPickedColor = chooseColor(newColors);
    setColors(newColors);
    setPickedColor(newPickedColor);
    setMessage("");
  }, [numSquares]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleSquareClick = (color) => {
    if (color === pickedColor) {
      setMessage("Correct");
      changeColors(color);
    } else {
      setMessage("Try Again");
    }
  };

  const changeColors = (color) => {
    const updatedColors = colors.map(() => color);
    setColors(updatedColors);
  };

  const handleModeClick = (mode) => {
    setNumSquares(mode === "Easy" ? 3 : 6);
    resetGame();
  };

  return (
    <>
      <Header />
      <Back />
      <div className="gth-game flex flex-col items-center justify-center text-white px-4 mb-52">
        {/* Home Icon */}
        <div className="my-4">
          <a href="https://kunjgit.github.io/GameZone/">
            <i className="fas fa-home home-icon text-white text-2xl"></i>
          </a>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl text-center text-white font-bold mb-4 md:mb-6">
          Guess The Color
        </h1>

        <h1 className="text-4xl font-bold mb-4">
          <span id="color-display" className="text-blue-400">
            {pickedColor}
          </span>
        </h1>

        <div
          id="stripe"
          className="flex items-center justify-between bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-2xl space-x-4"
        >
          <button
            id="reset"
            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
            onClick={resetGame}
          >
            New Colors
          </button>

          <span id="message" className="text-lg font-medium">
            {message}
          </span>

          <div className="flex space-x-4">
            <button
              className={`mode ${
                numSquares === 3 ? "bg-blue-500" : "bg-gray-700"
              } hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300`}
              onClick={() => handleModeClick("Easy")}
            >
              Easy
            </button>

            <button
              className={`mode ${
                numSquares === 6 ? "bg-blue-500" : "bg-gray-700"
              } hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300`}
              onClick={() => handleModeClick("Hard")}
            >
              Hard
            </button>
          </div>
        </div>

        <div id="container" className="flex justify-center space-x-4 mt-8">
          {colors.map((color, index) => (
            <div
              key={index}
              className="square h-32 w-24 rounded-lg shadow-lg transform transition hover:scale-105 hover:shadow-2xl cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => handleSquareClick(color)}
            ></div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GTH;
