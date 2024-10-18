import Header from '../header/Header';
import * as S from './styles';

const LevelScreen = ({ level, setLevel }) => (
  <S.Level>
    <Header />
    <S.LevelContent>
      <S.LevelTitle>SELECT LEVEL</S.LevelTitle>
      <S.LevelButtons>
        <S.LevelButton
          className={level === "easy" && "active"}
          onClick={() => setLevel("easy")}
        >
          Easy
        </S.LevelButton>
        <S.LevelButton
          className={level === "medium" && "active"}
          onClick={() => setLevel("medium")}
        >
          Medium
        </S.LevelButton>
        <S.LevelButton
         className={level === "hard" && "active"}
          onClick={() => setLevel("hard")}
        >
          Hard
        </S.LevelButton>
        <S.LevelButton
         className={level === "expert" && "active"}
          onClick={() => setLevel("expert")}
        >
          Expert
        </S.LevelButton>
      </S.LevelButtons>
    </S.LevelContent>
  </S.Level>
);

export default LevelScreen;
