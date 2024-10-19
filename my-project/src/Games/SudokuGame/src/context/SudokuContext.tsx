import React, { createContext, useContext, useState } from 'react';
import moment from 'moment';

const SudokuContext = createContext({
  numberSelected: '0',
  setNumberSelected: () => {},
  gameArray: [],
  setGameArray: () => {},
  difficulty: 'Easy',
  setDifficulty: () => {},
  timeGameStarted: moment(),
  setTimeGameStarted: () => {},
  fastMode: false,
  setFastMode: () => {},
  cellSelected: -1,
  setCellSelected: () => {},
  initArray: [],
  setInitArray: () => {},
  won: false,
  setWon: () => {},
});

export const SudokuProvider = ({ children }) => {
  const [numberSelected, setNumberSelected] = useState('0');
  const [gameArray, setGameArray] = useState([]);
  const [difficulty, setDifficulty] = useState('Easy');
  const [timeGameStarted, setTimeGameStarted] = useState(moment());
  const [fastMode, setFastMode] = useState(false);
  const [cellSelected, setCellSelected] = useState(-1);
  const [initArray, setInitArray] = useState([]);
  const [won, setWon] = useState(false);

  return (
    <SudokuContext.Provider value={{
      numberSelected, setNumberSelected,
      gameArray, setGameArray,
      difficulty, setDifficulty,
      timeGameStarted, setTimeGameStarted,
      fastMode, setFastMode,
      cellSelected, setCellSelected,
      initArray, setInitArray,
      won, setWon
    }}>
      {children}
    </SudokuContext.Provider>
  );
};

export const useSudokuContext = () => useContext(SudokuContext);
