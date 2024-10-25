/** @format */

import { useState } from "react";
import rockImage from "./Images/rock.png";
import paperImage from "./Images/paper.png";
import scissorsImage from "./Images/scissors.png";
import "./Game.css";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Back from "../../Components/Back";

const RockPaperScissors = () => {
  const [userScore, setUserScore] = useState(0);
  const [compScore, setCompScore] = useState(0);
  const [msg, setMsg] = useState("Play your move");

  const choices = ["rock", "paper", "scissors"];

  const genCompChoice = () => {
    const randIdx = Math.floor(Math.random() * choices.length);
    return choices[randIdx];
  };

  const updateScore = (userScore, compScore) => {
    setUserScore(userScore);
    setCompScore(compScore);
  };

  const showWinner = (userChoice) => {
    const compChoice = genCompChoice();

    if (userChoice === compChoice) {
      setMsg("Game was Draw. Play again.");
    } else {
      let userWin = false;
      if (
        (userChoice === "rock" && compChoice === "scissors") ||
        (userChoice === "scissors" && compChoice === "paper") ||
        (userChoice === "paper" && compChoice === "rock")
      ) {
        userWin = true;
      }

      if (userWin) {
        setUserScore(userScore + 1);
        setMsg(`You win! Your ${userChoice} beats ${compChoice}`);
      } else {
        setCompScore(compScore + 1);
        setMsg(`You lost. ${compChoice} beats your ${userChoice}`);
      }
    }
  };

  return (
    <>
      <Header />
      <Back />
      <div className="game-container flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg">
        <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600">
          Rock Paper Scissors
        </h1>

        <div className="choices flex justify-center gap-6 mb-8">
          <div
            className="choice cursor-pointer transform hover:scale-110 transition-transform duration-200"
            onClick={() => showWinner("rock")}
          >
            <img
              src={rockImage}
              alt="Rock"
              className="w-36 h-36 rounded-full border-4 border-yellow-500 p-2 hover:border-yellow-300"
            />
          </div>
          <div
            className="choice cursor-pointer transform hover:scale-110 transition-transform duration-200"
            onClick={() => showWinner("paper")}
          >
            <img
              src={paperImage}
              alt="Paper"
              className="w-36 h-36 rounded-full border-4 border-yellow-500 p-2 hover:border-yellow-300"
            />
          </div>
          <div
            className="choice cursor-pointer transform hover:scale-110 transition-transform duration-200"
            onClick={() => showWinner("scissors")}
          >
            <img
              src={scissorsImage}
              alt="Scissors"
              className="w-36 h-36 rounded-full border-4 border-yellow-500 p-2 hover:border-yellow-300"
            />
          </div>
        </div>

        <div className="board text-center bg-white bg-opacity-90 rounded-lg shadow-lg p-8 transition-transform transform hover:scale-105">
          <p className="text-lg font-semibold text-gray-700 mb-4" id="msg">
            {msg}
          </p>
          <p className="text-3xl font-bold text-blue-900 mb-4 ml-24">Wins</p>
          <div className="flex flex-col md:flex-row justify-between items-center mt-4 w-full">
            <div className="score text-center mb-6 md:mb-0">
              <p className="text-4xl font-bold text-blue-600" id="user-score">
                {userScore}
              </p>
              <p className="text-md text-gray-600">You</p>
            </div>
            <div className="score text-center">
              <p className="text-4xl font-bold text-red-600" id="comp-score">
                {compScore}
              </p>
              <p className="text-md text-gray-600">Computer</p>
            </div>
          </div>
        </div>

        <div className="msg-container mt-8">
          <button
            className="reset bg-red-600 text-white py-2 px-6 rounded-full hover:bg-red-500 transition duration-200 shadow-lg"
            onClick={() => updateScore(0, 0)}
          >
            Reset Score
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default RockPaperScissors;
