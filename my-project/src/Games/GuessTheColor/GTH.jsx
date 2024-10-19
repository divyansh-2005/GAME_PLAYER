import { useState, useEffect, useCallback } from "react";

import { generateRandomColors, chooseColor } from "./colorUtils";
import './style.css'
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";

import Back from '../../Components/Back';

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
  };

  return (
    <>
    <Header/>
    <Back/>
    <div className="gth-game">
      <div style={{ textAlign: "center", margin: "20px", fontSize: "30px" }}>
        <a href="https://kunjgit.github.io/GameZone/">
          <i style={{ color: "white" }} className="fas fa-home home-icon"></i>
        </a>
      </div>
      <h1>
        Guess by <span id="color-display">{pickedColor}</span>
      </h1>
      <div id="stripe">
        <button id="reset" onClick={resetGame}>New Colors</button>
        <span id="message">{message}</span>
        <button
          className={`mode ${numSquares === 3 ? "selected" : ""}`}
          onClick={() => handleModeClick("Easy")}
        >
          Easy
        </button>
        <button
          className={`mode ${numSquares === 6 ? "selected" : ""}`}
          onClick={() => handleModeClick("Hard")}
        >
          Hard
        </button>
      </div>
      <div id="container">
        {colors.map((color, index) => (
          <div
            key={index}
            className="square"
            style={{ backgroundColor: color }}
            onClick={() => handleSquareClick(color)}
          ></div>
        ))}
      </div>
    </div>
    <Footer/>
    </>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export default GTH;
