<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import Header from '../../Components/Header';
import Back from '../../Components/Back';
import Footer from '../../Components/Footer';
=======
// import React, { useState, useEffect } from 'react';

// import Header from '../../Components/Header';
// const WordGuessingGame = () => {
//   const wordList = [
//     { word: 'REACT', clue: 'A popular JavaScript library for building UIs', category: 'Tech' },
//     { word: 'JAVASCRIPT', clue: 'The programming language of the web', category: 'Tech' },
//     { word: 'ELEPHANT', clue: 'The largest land animal', category: 'Animals' },
//     { word: 'INCEPTION', clue: 'A famous science fiction movie directed by Christopher Nolan', category: 'Movies' }
//   ];

//   const randomWordObject = wordList[Math.floor(Math.random() * wordList.length)];
//   const [word] = useState(randomWordObject.word);
//   const [clue] = useState(randomWordObject.clue);
//   const [category] = useState(randomWordObject.category);
//   const [guessedLetters, setGuessedLetters] = useState([]);
//   const [wrongGuesses, setWrongGuesses] = useState(0);
//   const maxWrongGuesses = 6;

//   useEffect(() => {
//     const handleKeyboardInput = (event) => {
//       const letter = event.key.toUpperCase();
//       if (/^[A-Z]$/.test(letter)) {
//         handleGuess(letter);
//       }
//     };

//     window.addEventListener('keydown', handleKeyboardInput);
//     return () => {
//       window.removeEventListener('keydown', handleKeyboardInput);
//     };
//   }, [guessedLetters, wrongGuesses]);

//   const handleGuess = (letter) => {
//     if (guessedLetters.includes(letter) || wrongGuesses >= maxWrongGuesses) return;

//     setGuessedLetters((prevGuesses) => [...prevGuesses, letter]);

//     if (!word.includes(letter)) {
//       setWrongGuesses((prevWrongGuesses) => prevWrongGuesses + 1);
//     }
//   };

//   const displayWord = () => {
//     return word
//       .split('')
//       .map((letter) => (
//         <span
//           key={letter}
//           style={{
//             fontSize: '3rem',
//             color: 'white',
//             margin: '0 5px',
//           }}
//         >
//           {guessedLetters.includes(letter) ? letter : '_'}
//         </span>
//       ));
//   };

//   const resetGame = () => {
//     setGuessedLetters([]);
//     setWrongGuesses(0);
//     const randomWordObject = wordList[Math.floor(Math.random() * wordList.length)];
//     word = randomWordObject.word;
//     clue = randomWordObject.clue;
//   };

//   const isWinner = word.split('').every((letter) => guessedLetters.includes(letter));

//   const renderKeyboard = () => {
//     const rows = [
//       ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
//       ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
//       ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
//     ];

//     return rows.map((row, rowIndex) => (
//       <div key={rowIndex} style={{ display: 'flex', justifyContent: 'center', margin: '5px 0' }}>
//         {row.map((letter) => {
//           let buttonStyle = {
//             padding: '10px',
//             margin: '5px',
//             border: 'none',
//             borderRadius: '5px',
//             cursor: 'pointer',
//             backgroundColor: 'blue',
//             color: 'white',
//             boxShadow: `0 0 10px blue`,
//             fontSize: '20px',
//             transition: 'all 0.3s ease'
//           };

//           if (guessedLetters.includes(letter)) {
//             buttonStyle.backgroundColor = word.includes(letter) ? 'green' : 'red';
//             buttonStyle.boxShadow = `0 0 10px ${buttonStyle.backgroundColor}`;
//           }

//           return (
//             <button
//               key={letter}
//               style={buttonStyle}
//               onClick={() => handleGuess(letter)}
//               disabled={guessedLetters.includes(letter)}
//             >
//               {letter}
//             </button>
//           );
//         })}
//       </div>
//     ));
//   };

//   const renderHangman = () => {
//     const hangmanStages = [
//       '   \n   \n   \n   \n   \n   \n',
//       '   \n   \n   \n   \n   \n   |\n',
//       '   \n   \n   \n   O\n   |\n',
//       '   \n   \n   O\n  /|\\\n   |\n',
//       '   \n   O\n  /|\\\n   |\n',
//       '   O\n  /|\\\n   |\n  /\n',
//       '   O\n  /|\\\n   |\n  / \\\n'
//     ];
//     return <pre style={{ fontSize: '20px', textAlign: 'left' }}>{hangmanStages[wrongGuesses]}</pre>;
//   };

//   return (
//     <div>
//       <Header />
//       <div style={{ textAlign: 'center', display: 'flex' }}>
//         <div style={{ flex: 1 }}>
//           <h1
//             style={{
//               fontFamily: 'Roboto, sans-serif',
//               fontWeight: 'bold',
//               fontSize: '3rem',
//               marginBottom: '3%',
//               color: 'transparent',
//               background: 'linear-gradient(to right, #ff0000, #ff7300)',
//               WebkitBackgroundClip: 'text',
//               backgroundClip: 'text',
//               border: '5px solid #ff0000',
//               padding: '10px',
//               textShadow: '0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 15px #ff0000',
//             }}
//           >
//             Word Guessing Game
//           </h1>

//           {isWinner ? (
//             <div style={winnerStyle}>
//               <h2 style={{ fontSize: '4rem', color: 'green', animation: 'bounce 0.5s', width: '50%' }}>🎉 You won! 🎉</h2>
//               <button style={buttonStyle} onClick={resetGame}>Play Again</button>
//             </div>
//           ) : wrongGuesses >= maxWrongGuesses ? (
//             <div style={loserStyle}>
//               <h2 style={{ fontSize: '4rem', color: 'red', animation: 'shake 0.5s', width: '50%' }}>😢 You lost! 😢</h2>
//               <p>The word was: <strong>{word}</strong></p>
//               <button style={buttonStyle} onClick={resetGame}>Play Again</button>
//             </div>
//           ) : (
//             <>
//               <p><strong>Category:</strong> {category}</p>
//               <p><strong>Clue:</strong> {clue}</p>
//               <h2>{displayWord()}</h2>
//               <p>Wrong guesses: {wrongGuesses}/{maxWrongGuesses}</p>
//               {renderKeyboard()}
//             </>
//           )}
//         </div>
//         <div style={{ flex: 1, padding: '20px' }}>
//           {renderHangman()}
//         </div>
//       </div>
//     </div>
//   );
// };

// const winnerStyle = {
//   textAlign: 'center',
//   padding: '40px',
//   border: '5px solid green',
//   backgroundColor: '#e0ffe0',
//   boxShadow: '0 0 20px green',
//   margin: '20px auto',
//   width: '150%',
//   height: '300px',
//   display: 'flex',
//   flexDirection: 'column',
//   justifyContent: 'center',
//   alignItems: 'center',
//   transition: 'all 0.3s ease',
// };

// const loserStyle = {
//   textAlign: 'center',
//   padding: '40px',
//   border: '5px solid red',
//   backgroundColor: '#ffe0e0',
//   boxShadow: '0 0 20px red',
//   margin: '20px auto',
//   width: '150%',
//   height: '400px',
//   display: 'flex',
//   flexDirection: 'column',
//   justifyContent: 'center',
//   alignItems: 'center',
//   transition: 'all 0.3s ease',
// };

// const buttonStyle = {
//   padding: '15px 30px',
//   fontSize: '20px',
//   borderRadius: '5px',
//   border: 'none',
//   backgroundColor: '#007bff',
//   color: 'white',
//   cursor: 'pointer',
//   marginTop: '20px',
//   transition: 'background-color 0.3s',
// };

// export default WordGuessingGame;
import React, { useState, useEffect } from "react";
import Header from "../../Components/Header";
>>>>>>> d28c0001109b89c58549b2cb7382a0b980a55a39

const WordGuessingGame = () => {
  const wordList = [
    {
      word: "REACT",
      clue: "A popular JavaScript library for building UIs",
      category: "Tech",
    },
    {
      word: "JAVASCRIPT",
      clue: "The programming language of the web",
      category: "Tech",
    },
    { word: "ELEPHANT", clue: "The largest land animal", category: "Animals" },
    {
      word: "INCEPTION",
      clue: "A famous science fiction movie directed by Christopher Nolan",
      category: "Movies",
    },
  ];

  const randomWordObject =
    wordList[Math.floor(Math.random() * wordList.length)];
  let [word] = useState(randomWordObject.word);
  let [clue] = useState(randomWordObject.clue);
  const [category] = useState(randomWordObject.category);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const maxWrongGuesses = 6;

  useEffect(() => {
    const handleKeyboardInput = (event) => {
      const letter = event.key.toUpperCase();
      if (/^[A-Z]$/.test(letter)) {
        handleGuess(letter);
      }
    };

    window.addEventListener("keydown", handleKeyboardInput);
    return () => {
      window.removeEventListener("keydown", handleKeyboardInput);
    };
  }, [guessedLetters, wrongGuesses]);

  const handleGuess = (letter) => {
    if (guessedLetters.includes(letter) || wrongGuesses >= maxWrongGuesses)
      return;

    setGuessedLetters((prevGuesses) => [...prevGuesses, letter]);

    if (!word.includes(letter)) {
      setWrongGuesses((prevWrongGuesses) => prevWrongGuesses + 1);
    }
  };

  const displayWord = () => {
    return word.split("").map((letter) => (
      <span
        key={letter}
        style={{
          fontSize: "3rem",
          color: "white",
          margin: "0 5px",
        }}
      >
        {guessedLetters.includes(letter) ? letter : "_"}
      </span>
    ));
  };

  const resetGame = () => {
    setGuessedLetters([]);
    setWrongGuesses(0);
    const randomWordObject =
      wordList[Math.floor(Math.random() * wordList.length)];
    word = randomWordObject.word;
    clue = randomWordObject.clue;
  };

  const isWinner = word
    .split("")
    .every((letter) => guessedLetters.includes(letter));

  const renderKeyboard = () => {
    const rows = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["Z", "X", "C", "V", "B", "N", "M"],
    ];

    return rows.map((row, rowIndex) => (
      <div
        key={rowIndex}
        style={{ display: "flex", justifyContent: "center", margin: "5px 0" }}
      >
        {row.map((letter) => {
          let buttonStyle = {
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            backgroundColor: "blue",
            color: "white",
            boxShadow: `0 0 10px blue`,
            fontSize: "20px",
            transition: "all 0.3s ease",
          };

          if (guessedLetters.includes(letter)) {
            buttonStyle.backgroundColor = word.includes(letter)
              ? "green"
              : "red";
            buttonStyle.boxShadow = `0 0 10px ${buttonStyle.backgroundColor}`;
          }

          return (
            <button
              key={letter}
              style={buttonStyle}
              onClick={() => handleGuess(letter)}
              disabled={guessedLetters.includes(letter)}
            >
              {letter}
            </button>
          );
        })}
      </div>
    ));
  };

  const renderHangman = () => {
    const hangmanStages = [
      "   \n   \n   \n   \n   \n   \n",
      "   \n   \n   \n   \n   \n   |\n",
      "   \n   \n   \n   O\n   |\n",
      "   \n   \n   O\n  /|\\\n   |\n",
      "   \n   O\n  /|\\\n   |\n",
      "   O\n  /|\\\n   |\n  /\n",
      "   O\n  /|\\\n   |\n  / \\\n",
    ];
    return (
      <pre style={{ fontSize: "20px", textAlign: "left" }}>
        {hangmanStages[wrongGuesses]}
      </pre>
    );
  };

  return (
<<<<<<< HEAD
    <>
      <Header />
      <Back />
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 border-4 border-red-500 p-4 rounded-lg shadow-xl text-center">
          Word Guessing Game
        </h1>

        {isWinner ? (
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl text-green-500 animate-bounce mb-6">
              🎉 You won! 🎉
            </h2>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full shadow-md transition duration-300 ease-in-out"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        ) : wrongGuesses >= maxWrongGuesses ? (
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl text-red-500 animate-shake mb-6">
              😢 You lost! 😢
            </h2>
            <p className="text-lg">
              The word was: <strong>{word}</strong>
            </p>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full shadow-md transition duration-300 ease-in-out mt-4"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        ) : (
          <>
            <p className="text-lg md:text-xl mb-2">
              <strong>Category:</strong> {category}
            </p>
            <p className="text-lg md:text-xl mb-4">
              <strong>Clue:</strong> {clue}
            </p>
            <h2 className="text-3xl md:text-5xl font-semibold mb-6">
              {displayWord()}
            </h2>
            <p className="text-lg">
              Wrong guesses: {wrongGuesses}/{maxWrongGuesses}
            </p>
            <div className="mt-4">{renderKeyboard()}</div>
          </>
        )}

        <div className="mt-8">{renderHangman()}</div>
      </div>
      <Footer />
    </>
=======
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Header style={{ marginBottom: "20px" }} />
      <h1
        style={{
          fontFamily: "Roboto, sans-serif",
          fontWeight: "bold",
          fontSize: "3rem",
          marginBottom: "3%",
          color: "transparent",
          background: "linear-gradient(to right, #ff0000, #ff7300)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          border: "5px solid #ff0000",
          padding: "10px",
          textShadow: "0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 15px #ff0000",
        }}
      >
        Word Guessing Game
      </h1>

      {isWinner ? (
        <div style={winnerStyle}>
          <h2
            style={{
              fontSize: "4rem",
              color: "green",
              animation: "bounce 0.5s",
              width: "50%",
            }}
          >
            🎉 You won! 🎉
          </h2>
          <button style={buttonStyle} onClick={resetGame}>
            Play Again
          </button>
        </div>
      ) : wrongGuesses >= maxWrongGuesses ? (
        <div style={loserStyle}>
          <h2
            style={{
              fontSize: "4rem",
              color: "red",
              animation: "shake 0.5s",
              width: "50%",
            }}
          >
            😢 You lost! 😢
          </h2>
          <p>
            The word was: <strong>{word}</strong>
          </p>
          <button style={buttonStyle} onClick={resetGame}>
            Play Again
          </button>
        </div>
      ) : (
        <>
          <p>
            <strong>Category:</strong> {category}
          </p>
          <p>
            <strong>Clue:</strong> {clue}
          </p>
          <h2>{displayWord()}</h2>
          <p>
            Wrong guesses: {wrongGuesses}/{maxWrongGuesses}
          </p>
          {renderKeyboard()}
        </>
      )}
      <div style={{ padding: "20px" }}>{renderHangman()}</div>
    </div>
>>>>>>> d28c0001109b89c58549b2cb7382a0b980a55a39
  );
};

const winnerStyle = {
  textAlign: "center",
  padding: "40px",
  border: "5px solid green",
  backgroundColor: "#e0ffe0",
  boxShadow: "0 0 20px green",
  margin: "20px auto",
  width: "100%",
  height: "300px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  transition: "all 0.3s ease",
};

const loserStyle = {
  textAlign: "center",
  padding: "40px",
  border: "5px solid red",
  backgroundColor: "#ffe0e0",
  boxShadow: "0 0 20px red",
  margin: "20px auto",
  width: "100%",
  height: "400px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  transition: "all 0.3s ease",
};

const buttonStyle = {
  padding: "15px 30px",
  fontSize: "20px",
  borderRadius: "5px",
  border: "none",
  backgroundColor: "#007bff",
  color: "white",
  cursor: "pointer",
  marginTop: "20px",
  transition: "background-color 0.3s",
};

export default WordGuessingGame;
