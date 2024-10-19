import React, { useEffect, useState } from "react";
import * as S from "./styles";

const Word = ({
  word,
  words,
  setWords,
  index,
  level,
  typingWord,
  setTypingWord,
  matchedWord,
  setMatchedWord,
  health,
  setHealth,
  score,
  setScore,
}) => {
  const [topPosition, setTopPosition] = useState(-Math.random() * 200);

  const [leftPosition, setLeftPosition] = useState(Math.random() * 90);


  useEffect(() => {
    const levelSpeed = () => {
      if (level === "easy") {
        return 1;
      } else if (level === "medium") {
        return 2;
      } else if (level === "hard") {
        return 3;
      } else if (level === "expert") {
        return 4;
      }
    };

    const interval = setInterval(() => {
      setTopPosition((prevPosition) => prevPosition + levelSpeed());
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const setColor = (letter, index) => {
    const typedLetter = typingWord[index];

    if (matchedWord === word && typedLetter && typedLetter !== letter) {
      return "rgba(255, 0, 0, 1)";
    } else if (typingWord === word) {
      const updatedWords = words.map((w) => {
        if (w === word) {
          return "+";
        } else {
          return w;
        }
      });
      
      setWords(updatedWords);
      setMatchedWord("");
      setTypingWord("");
      setScore((prevScore) => prevScore + 1);
      
      return "rgba(0, 255, 0, 1)";
    }else if (matchedWord === word && typingWord[index] === letter) {
      return "rgba(239, 239, 239, 1)";
    } else {
      return "rgba(255, 255, 255, 0.2)";
    }
  };

  const healtDamage = () => {
    if (level === "easy") {
      return health - 1;
    } else if (level === "medium") {
      return health - 2;
    } else if (level === "hard") {
      return health - 2;
    } else if (level === "expert") {
      return health - 3;
    }
  };  

  useEffect(() => {
    if (topPosition > 90) {
      setWords(words.filter((w) => w !== word));

      setHealth(healtDamage());
    }
  }, [topPosition]);


  return (
    <S.WordBox
      className="word-box"
      key={index}
      style={{
        left: `${leftPosition}%`,
        top: topPosition < 92 ? `${topPosition}%` : "92%",
        scale: matchedWord === word ? "1.3" : "1",
      }}
    >
      {word.split("").map((letter, index) => (
        <div className="letter-box" key={index}>
          <div className="letter" style={{ color: setColor(letter, index) }}>
            {letter}
          </div>
        </div>
      ))}
    </S.WordBox>
  );
};

export default Word;
