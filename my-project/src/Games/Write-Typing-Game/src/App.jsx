// App.jsx
import { useEffect, useState } from "react";
import styles from "./App.module.css";
import GameScreen from "./components/game-screen/GameScreen";
import LevelScreen from "./components/level-screen/LevelScreen";
import { easyWords, mediumWords, hardWords, expertWords } from "./config/words";
import GameOver from './components/game-over/GameOver';

const App = () => {
  const [currentState, setCurrentState] = useState("level");
  const [level, setLevel] = useState("");
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [typingWord, setTypingWord] = useState("");
  const [matchedWord, setMatchedWord] = useState("");
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);

  useEffect(() => {
    if (level !== "") {
      if (level === "easy") {
        setWords(easyWords);
      } else if (level === "medium") {
        setWords(mediumWords);
      } else if (level === "hard") {
        setWords(hardWords);
      } else if (level === "expert") {
        setWords(expertWords);
      }

      // Directly set the state to "game" once the level is selected.
      setCurrentState("game");
    }
  }, [level]);

  useEffect(() => {
    // Only transition to "game-over" if the health reaches zero
    if (health <= 0) {
      setCurrentState("game-over");
    }
  }, [health]);

  useEffect(() => {
    setCurrentWord("");
    setMatchedWord("");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Backspace") {
        if (typingWord === "") {
          setCurrentWord("");
        } else {
          setTypingWord((prev) => prev.slice(0, -1));
        }
      } else {
        if (/^[a-zA-Z]+$/.test(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
          if (!matchedWord) {
            const matchingWords = words.filter((word) => word.startsWith(e.key));
            if (matchingWords.length > 0) {
              setCurrentWord(matchingWords[0]);
            }
            setMatchedWord(matchingWords[0]);
          }

          setTypingWord((prev) => prev + e.key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [words, typingWord, matchedWord]);

  // Function to restart the game
  const handleRestart = () => {
    setCurrentState("level");
    setLevel("");
    setWords([]);
    setCurrentWord("");
    setTypingWord("");
    setMatchedWord("");
    setScore(0);
    setHealth(3);
  };

  return (
    <div className={styles.appBody}>
      {currentState === "level" ? <LevelScreen level={level} setLevel={setLevel} /> : null}
      {currentState === "game" && health > 0 ? (
        <GameScreen
          words={words}
          setWords={setWords}
          typingWord={typingWord}
          setTypingWord={setTypingWord}
          matchedWord={matchedWord}
          setMatchedWord={setMatchedWord}
          health={health}
          setHealth={setHealth}
          score={score}
          setScore={setScore}
          currentWord={currentWord}
          setCurrentWord={setCurrentWord}
          level={level}
          setCurrentState={setCurrentState}
          setLevel={setLevel}
        />
      ) : null}
      {currentState === "game-over" ? <GameOver onRestart={handleRestart} /> : null}
    </div>
  );
};

export default App;
