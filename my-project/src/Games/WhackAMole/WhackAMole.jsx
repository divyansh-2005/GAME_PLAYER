import React, { useState, useEffect } from "react";
import Header from "../../Components/Header";
import Back from '../../Components/Back';
import Footer from "../../Components/Footer";


const WhackAMole = () => {
  const [moles, setMoles] = useState(Array(9).fill(false)); // Array for mole positions
  const [score, setScore] = useState(0); // Track the score
  const [timeLeft, setTimeLeft] = useState(30); // Game timer
  const [isPlaying, setIsPlaying] = useState(false); // Track game state
  const [activeMole, setActiveMole] = useState(null); // Store current active mole

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (isPlaying) {
      const moleInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * moles.length);
        setActiveMole(randomIndex);
        setTimeout(() => setActiveMole(null), 600); // Mole disappears after 600ms
      }, 1000);

      return () => clearInterval(moleInterval);
    }
  }, [isPlaying]);

  const handleMoleClick = (index) => {
    if (index === activeMole) {
      setScore((prev) => prev + 1);
      setActiveMole(null); // Remove mole after hit
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30); // Reset the timer
    setIsPlaying(true);
  };

  return (
    <>
      <Header />
      <Back />
      <h1 className="text-4xl sm:text-5xl md:text-7xl text-center text-white font-extrabold mb-4 neon-text">
        Whack-a-Mole
      </h1>
      <div className="flex flex-col items-center justify-center h-[600px] bg-slate-800 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-semibold text-white mb-6">
          {isPlaying ? `Time Left: ${timeLeft}s` : "Game Over"}
        </h2>
        <h2 className="text-xl md:text-3xl font-semibold text-white mb-6">
          Score: {score}
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {moles.map((_, index) => (
            <div
              key={index}
              className={`w-24 h-24 rounded-full transition-all duration-300 ${
                index === activeMole
                  ? "bg-brown scale-110 shadow-xl transform rotate-12"
                  : "bg-gray-300 shadow-sm"
              }`}
              onClick={() => handleMoleClick(index)}
            />
          ))}
        </div>

        <button
          onClick={startGame}
          className={`px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold rounded-full shadow-xl transition-transform ${
            isPlaying ? "opacity-50 cursor-not-allowed" : "hover:scale-110"
          }`}
          disabled={isPlaying}
        >
          {isPlaying ? "Game in Progress..." : "Start Game"}
        </button>
      </div>
      <Footer />
    </>
  );
};

// Basic styles for Whack-a-Mole
const styles = {
  container: {
    fontSize: "1.8rem",
    maxWidth: "600px",
    margin: "50px auto",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    backgroundColor: "#ffffff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 120px)",
    gap: "15px",
    justifyContent: "center",
    marginBottom: "20px",
  },
  hole: {
    width: "120px",
    height: "120px",
    backgroundColor: "#ccc",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "transform 0.3s ease, background-color 0.3s ease",
  },
  startButton: {
    marginTop: "20px",
    padding: "15px 25px",
    backgroundColor: "#4a90e2",
    color: "#fff",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
    transition: "background-color 0.3s ease, transform 0.3s ease",
  },
};


export default WhackAMole;
