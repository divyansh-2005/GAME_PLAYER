import Heart from "./Heart";
import Word from "./Word";
import Restart from "./Restart";

import * as S from "./styles";

const Bottom = ({ currentWord, typingWord, setCurrentWord, health, matchedWord, setCurrentState, setLevel }) => {
  const setColor = (letter, index) => {
    console.log(typingWord);
    if (typingWord && typingWord[index]) {
      const typedLetter = typingWord[index];

      if (typedLetter !== letter) {
        return "rgba(255, 0, 0, 1)";
      } else if (typingWord === currentWord) {
        setCurrentWord("");
        return "rgba(0, 255, 0, 1)";
      } else {
        return "rgba(239, 239, 239, 1)";
      }
    }
  };

  return (
    <S.Bottom>
      <Heart health={health} />
      <Word setColor={setColor} currentWord={currentWord} />
      <Restart setCurrentState={setCurrentState} setLevel={setLevel} />
    </S.Bottom>
  );
};

export default Bottom;
