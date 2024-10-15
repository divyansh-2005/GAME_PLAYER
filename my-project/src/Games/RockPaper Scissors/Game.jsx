// RockPaperScissors.jsx

import  { useState } from 'react';
import rockImage from './Images/rock.png';
import paperImage from './Images/paper.png';
import scissorsImage from './Images/scissors.png';
import './Game.css'
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import Back from '../../Components/Back';


const RockPaperScissors = () => {
  const [userScore, setUserScore] = useState(0);
  const [compScore, setCompScore] = useState(0);
  const [msg, setMsg] = useState('Play your move');

  const choices = ['rock', 'paper', 'scissors'];

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
      setMsg('Game was Draw. Play again.');
    } else {
      let userWin = false;
      if (
        (userChoice === 'rock' && compChoice === 'scissors') ||
        (userChoice === 'scissors' && compChoice === 'paper') ||
        (userChoice === 'paper' && compChoice === 'rock')
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
    <Header/>
    <Back />
    <div className="game-container">
      <div className="choices">
        <div className="choice" onClick={() => showWinner('rock')}>
          <img src={rockImage} alt="Rock" />
        </div>
        <div className="choice" onClick={() => showWinner('paper')}>
          <img src={paperImage} alt="Paper" />
        </div>
        <div className="choice" onClick={() => showWinner('scissors')}>
          <img src={scissorsImage} alt="Scissors" />
        </div>
      </div>


      
      <div className="board">
      
        <p id="msg">{msg}</p>
        <p className="p">Wins</p>
        <div className="score-board">
          <div className="score">
            <p id="user-score">{userScore}</p>
            <p>You</p>
          </div>
          <div className="score">
            <p id="comp-score">{compScore}</p>
            <p>Computer</p>
          </div>
        </div>
      </div>

      <div className="msg-container">
      <button className="reset" onClick={() => updateScore(0, 0)}>
          Reset Score
        </button>
       
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default RockPaperScissors;
