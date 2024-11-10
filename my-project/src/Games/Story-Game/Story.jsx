import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Story.css';
import { FaClock } from 'react-icons/fa';
const questions = [
  {
    question: "A man was found dead in his study. The police discovered a table with a half-finished puzzle, a broken clock, and a glass of spilled water. How did the man die?",
    options: ['Drowned', 'Heart Attack', 'Murdered', 'Suicide'],
    answer: 'Murdered',
    hint: "Consider the clues in the room that suggest foul play.",
  },
  {
    question: "In a small village, there are three houses: one is red, one is blue, and one is green. Each house has a different owner. The owner of the red house is a baker, the blue house owner is a teacher, and the green house owner is a doctor. If the baker has a cat and the teacher has a dog, what kind of pet does the doctor have?",
    options: ['Cat', 'Dog', 'Bird', 'None'],
    answer: 'None',
    hint: "Think about the relationships between the owners and their pets.",
  },
  {
    question: "During a storm, a ship carrying prisoners capsizes. After several hours, a rescue team finds only four prisoners alive. They ask each prisoner how they survived. One says he swam to shore, another says he clung to a piece of debris, the third says he was rescued by a passing boat, and the fourth says he never left the ship. Who is lying?",
    options: ['The swimmer', 'The one on debris', 'The one rescued by a boat', 'The one who stayed'],
    answer: 'The one who stayed',
    hint: "Consider the circumstances of the capsized ship.",
  },
  {
    question: "A detective is called to a mansion where a valuable painting has gone missing. The owner claims he last saw it at 3 PM. The gardener, the maid, and the butler all give alibis. The gardener says he was pruning the roses, the maid claims she was cleaning the attic, and the butler insists he was polishing the silver. The detective finds a fresh rose petal on the floor next to the painting's spot. Who stole the painting?",
    options: ['Gardener', 'Maid', 'Butler', 'None'],
    answer: 'Gardener',
    hint: "Think about how the rose petal relates to the gardener's alibi.",
  },
  {
    question: "A woman is standing in front of a mirror. She says, 'I am looking at my brother's sister's son.' How is the woman related to the boy she is looking at?",
    options: ['Mother', 'Aunt', 'Sister', 'Cousin'],
    answer: 'Mother',
    hint: "Follow the relationships step by step.",
  },
  {
    question: "A farmer has a fox, a chicken, and a bag of grain. He needs to cross a river but can only take one item at a time. If he leaves the fox alone with the chicken, the fox will eat the chicken. If he leaves the chicken alone with the grain, the chicken will eat the grain. How can the farmer get all three across safely?",
    options: ['Take the fox first', 'Take the chicken first', 'Take the grain first', 'Take the chicken then the grain'],
    answer: 'Take the chicken first',
    hint: "Plan the crossings carefully to avoid leaving the wrong pair together.",
  },
  {
    question: "A magician was found dead in his dressing room after a show. The only clues were a broken mirror, a spilled deck of cards, and a top hat filled with water. How did the magician die?",
    options: ['Accidental Drowning', 'Fell on the Mirror', 'Murdered by a Rival', 'Card Trick Gone Wrong'],
    answer: 'Murdered by a Rival',
    hint: "Consider the symbolism of the items left behind and the nature of a magician's rivals.",
  },
  {
    question: "A group of explorers found an ancient treasure map that led to a hidden cave. Inside the cave, they discovered three locked chests. One chest is filled with gold coins, one with jewels, and the third is empty. Each chest has a riddle inscribed on it. They can only open one chest. The riddles are as follows: 'Open me for wealth untold, but only if your heart is bold.' 'Open me for beauty, but beware of the price.' 'Open me, and you’ll find nothing but dust.' Which chest should they open to find treasure?",
    options: ['Wealth Chest', 'Beauty Chest', 'Empty Chest', 'None of the Above'],
    answer: 'Wealth Chest',
    hint: "Analyze the tone and implications of the riddles carefully; what does each treasure symbolize?",
  },
  {
    question: "A man walks into a bar and orders a drink. He notices that there are three men sitting at a table: one is wearing a hat, one has a broken arm, and the last one has a pair of sunglasses. They seem to be discussing something seriously. When the man approaches, he overhears one of them say, 'We can't let him leave until we get what we want.' What is happening at the table?",
    options: ['A business deal', 'A plan for a heist', 'A game of poker', 'An argument over a bet'],
    answer: 'A plan for a heist',
    hint: "Think about the context of the bar and the implications of their serious demeanor.",
  },
  {
    question: "A thief stole a car but left it running in a parking lot. The police arrive and quickly surround the area, but the thief vanishes without a trace. How did he escape?",
    options: ['Disguised himself', 'Drove away', 'Used a decoy', 'Walked away calmly'],
    answer: 'Walked away calmly',
    hint: "Sometimes, the simplest solutions are the most effective.",
  },
];
function Story() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timer, setTimer] = useState(60);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    if (timer === 0) {
      nextQuestion();
    }

    return () => clearInterval(interval);
  }, [timer]);

  const nextQuestion = () => {
    if (selectedOption === questions[currentQuestionIndex].answer) {
      setScore(score + 10);
    }

    setAnsweredQuestions(answeredQuestions + 1);
    setShowAnswer(selectedOption !== questions[currentQuestionIndex].answer);

    setTimeout(() => {
      setShowAnswer(false);
      setSelectedOption(null);
      setShowHint(false);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimer(60);
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setTimer(60);
      setShowAnswer(false);
      setShowHint(false);
    }
  };

  const playAgain = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setTimer(60);
    setScore(0);
    setShowAnswer(false);
    setAnsweredQuestions(0);
    setGameOver(false);
    setShowHint(false);
  };

  const returnHome = () => {
    // Redirect to the home page
    window.location.href = '/';
  };
  const toggleHint = () => {
    setShowHint(!showHint);
  };

  if (gameOver) {
    const skippedQuestions = Math.max(0, questions.length - answeredQuestions);

    return (
      <div className="game-over-container flex justify-center items-center bg-gray-100 w-full max-w-lg md:w-auto">
        <motion.div
          className="game-over-card bg-white rounded-lg shadow-2xl p-8 md:p-12 max-w-lg w-full max-w-lg md:w-auto text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-5xl font-bold mb-6 animated-title">Game Over!</div>
          <div className="card-content space-y-4">
            <p className="text-2xl text-gray-700">
              Total Questions: <span className="font-semibold text-blue-500">{questions.length}</span>
            </p>
            <p className="text-2xl text-gray-700">
              Answered Correctly: <span className="font-semibold text-green-500">{score / 10}</span>
            </p>
            <p className="text-2xl text-gray-700">
              Answered Incorrectly: <span className="font-semibold text-red-500">{answeredQuestions - score / 10}</span>
            </p>

            <p className="text-2xl text-gray-700">
              Skipped Questions: <span className="font-semibold text-yellow-500">{skippedQuestions}</span>
            </p>
            <p className="text-3xl font-bold text-blue-600 mt-6">
              Total Score: <span>{score} Points</span>
            </p>
          </div>
          <motion.button
            className="play-again-button mt-8 px-8 py-3 bg-blue-500 text-white rounded-lg text-xl hover:bg-blue-600 shadow-md"
            onClick={playAgain}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Play Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (<div className='parent'>

    <div className="gcontainer">

      <div className="content-container">
        <div className="animated-title">Solve the Mystery</div>
        <motion.div
          className="question text-4xl font-semibold mb-4" // Increased font size for question
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          {questions[currentQuestionIndex].question}
        </motion.div>
        <div className="options">
          {questions[currentQuestionIndex].options.map((option, index) => (
            <motion.button
              key={index}
              className={`option-button text-3xl ${selectedOption === option ? 'selected' : ''
                } ${showAnswer && option === questions[currentQuestionIndex].answer ? 'correct-answer' : ''}`}
              onClick={() => setSelectedOption(option)}
              whileHover={{ scale: 1.05, backgroundColor: "#cce7ff" }}
              animate={selectedOption === option ? { scale: 1.1, backgroundColor: "#cce7ff" } : {}}
              transition={{ duration: 0.2 }}
            >
              {option}
            </motion.button>
          ))}
        </div>
        <div className="timer text-3xl mt-4 flex items-center">
          <FaClock className="text-3xl text-blue-500 mr-2" /> {/* Colorful Clock Icon */}
          Time Left: {timer}s
        </div>
        <div className="button-row">
          <motion.button
            className="btn"
            onClick={previousQuestion}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back
          </motion.button>
          <motion.button
            className="btn"
            onClick={nextQuestion}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Submit
          </motion.button>
          <motion.button
            className="btn"
            onClick={toggleHint}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </motion.button>
        </div>
        <div className="return-home">
          <motion.button
            className="return-home-button mt-8 px-8 py-3 bg-gray-600 text-white rounded-lg text-xl hover:bg-gray-700 shadow-md"
            onClick={returnHome}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Return to Home Page
          </motion.button>
        </div>
        {showHint && (
          <div className="hint text-gray-600 mt-4 text-3xl">
            Hint: {questions[currentQuestionIndex].hint}
          </div>
        )}
        {showAnswer && (
          <div className="answer text-3xl mt-2">
            {selectedOption === questions[currentQuestionIndex].answer ? "Correct!" : "Wrong! The correct answer is: " + questions[currentQuestionIndex].answer}
          </div>
        )}
      </div>
    </div>
  </div>
  );
}

export default Story;