import { useState, useEffect } from "react";
import moment from "moment";
import { Header } from "./components/layout/Header";
import { GameSection } from "./components/layout/GameSection";
import { StatusSection } from "./components/layout/StatusSection";
import { getUniqueSudoku } from "./solver/UniqueSudoku";
import { useSudokuContext } from "./context/SudokuContext";

/**
 * Game is the main React component.
 */
export const Game = () => {
  const {
    numberSelected,
    setNumberSelected,
    gameArray,
    setGameArray,
    difficulty,
    setDifficulty,
    setTimeGameStarted,
    fastMode,
    setFastMode,
    cellSelected,
    setCellSelected,
    initArray,
    setInitArray,
    setWon,
  } = useSudokuContext();

  const [mistakesMode, setMistakesMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [solvedArray, setSolvedArray] = useState([]);
  const [overlay, setOverlay] = useState(false);

  /**
   * Creates a new game and initializes the state variables.
   */
  function _createNewGame(e) {
    const [temporaryInitArray, temporarySolvedArray] = getUniqueSudoku(
      difficulty,
      e
    );
    setInitArray(temporaryInitArray);
    setGameArray(temporaryInitArray);
    setSolvedArray(temporarySolvedArray);
    setNumberSelected("0");
    setTimeGameStarted(moment());
    setCellSelected(-1);
    setHistory([]);
    setWon(false);
  }

  /**
   * Checks if the game is solved.
   */
  function _isSolved(index, value) {
    if (
      gameArray.every((cell, cellIndex) => {
        if (cellIndex === index) return value === solvedArray[cellIndex];
        else return cell === solvedArray[cellIndex];
      })
    ) {
      return true;
    }
    return false;
  }

  /**
   * Fills the cell with the given 'value'
   * Used to Fill / Erase as required.
   */
  function _fillCell(index, value) {
    if (initArray[index] === "0") {
      // Direct copy results in interesting set of problems, investigate more!
      let tempArray = gameArray.slice();
      let tempHistory = history.slice();
      // Can't use tempArray here, due to Side effect below!!
      tempHistory.push(gameArray.slice());
      setHistory(tempHistory);
      tempArray[index] = value;
      setGameArray(tempArray);
      if (_isSolved(index, value)) {
        setOverlay(true);
        setWon(true);
      }
    }
  }

  /**
   * A 'user fill' will be passed on to the
   * _fillCell function above.
   */
  function _userFillCell(index, value) {
    if (mistakesMode) {
      if (value === solvedArray[index]) {
        _fillCell(index, value);
      } else {
        // TODO: Flash - Mistakes not allowed in Mistakes Mode
      }
    } else {
      _fillCell(index, value);
    }
  }

  /**
   * On Click of 'New Game' link,
   * create a new game.
   */
  function onClickNewGame() {
    _createNewGame();
  }

  /**
   * On Click of a Game cell.
   */
  function onClickCell(indexOfArray) {
    if (fastMode && numberSelected !== "0") {
      _userFillCell(indexOfArray, numberSelected);
    }
    setCellSelected(indexOfArray);
  }

  /**
   * On Change Difficulty,
   * 1. Update 'Difficulty' level
   * 2. Create New Game
   */
  function onChangeDifficulty(e) {
    setDifficulty(e.target.value);
    _createNewGame(e);
  }

  /**
   * On Click of Number in Status section,
   * either fill cell or set the number.
   */
  function onClickNumber(number) {
    if (fastMode) {
      setNumberSelected(number);
    } else if (cellSelected !== -1) {
      _userFillCell(cellSelected, number);
    }
  }

  /**
   * On Click Undo,
   * try to Undo the latest change.
   */
  function onClickUndo() {
    if (history.length) {
      let tempHistory = history.slice();
      let tempArray = tempHistory.pop();
      setHistory(tempHistory);
      if (tempArray !== undefined) setGameArray(tempArray);
    }
  }

  /**
   * On Click Erase,
   * try to delete the cell.
   */
  function onClickErase() {
    if (cellSelected !== -1 && gameArray[cellSelected] !== "0") {
      _fillCell(cellSelected, "0");
    }
  }

  /**
   * On Click Hint,
   * fill the selected cell if its empty or wrong number is filled.
   */
  function onClickHint() {
    if (cellSelected !== -1) {
      _fillCell(cellSelected, solvedArray[cellSelected]);
    }
  }

  /**
   * Toggle Mistakes Mode
   */
  function onClickMistakesMode() {
    setMistakesMode(!mistakesMode);
  }

  /**
   * Toggle Fast Mode
   */
  function onClickFastMode() {
    if (fastMode) {
      setNumberSelected("0");
    }
    setCellSelected(-1);
    setFastMode(!fastMode);
  }

  /**
   * Close the overlay on Click.
   */
  function onClickOverlay() {
    setOverlay(false);
    _createNewGame();
  }

  /**
   * On load, create a New Game.
   */
  useEffect(() => {
    _createNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css?family=Teko|Noto+Sans|Source+Sans+Pro:300,400,600');

        :root {
              --background-color: #fff;
              --color-blue: hsl(210, 88%, 56%);
              --color-grey: hsl(213, 30%, 29%);
              --color-grey-light: hsl(213, 30%, 59%);
              --color-grey-lighter: hsl(213, 30%, 79%);
              --color-orange: hsl(34, 26%, 89%);
              --color-orange-dark: hsl(34, 76%, 89%);
          }      
          .container {
            max-width: 700px;
            min-width: 270px;
            margin: 0 auto;
            padding: 0 10px;
          }
        `}
      </style>
      <div
        className={overlay ? "container blur" : "container"}
        style={{ backgroundColor: "white" }}
      >
        <Header onClick={onClickNewGame} />
        <div className="innercontainer">
          <GameSection onClick={(indexOfArray) => onClickCell(indexOfArray)} />
          <StatusSection
            onClickNumber={(number) => onClickNumber(number)}
            onChange={(e) => onChangeDifficulty(e)}
            onClickUndo={onClickUndo}
            onClickErase={onClickErase}
            onClickHint={onClickHint}
            onClickMistakesMode={onClickMistakesMode}
            onClickFastMode={onClickFastMode}
          />
        </div>
      </div>
      <div
        className={overlay ? "overlay overlay--visible" : "overlay"}
        onClick={onClickOverlay}
      >
        <h2 className="overlay__text">
          You <span className="overlay__textspan1">solved</span>{" "}
          <span className="overlay__textspan2">it!</span>
        </h2>
      </div>
    </>
  );
};
