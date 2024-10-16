import React from 'react';
import { useSudokuContext } from '../context/SudokuContext';

/**
 * React component for the Number Selector in the Status Section.
 */
export const Numbers = ({ onClickNumber }) => {
  let { numberSelected } = useSudokuContext();

  return (
    <div className="status__numbers">
      {
        [1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <div
            className={`status__number ${numberSelected === number.toString() ? 'status__number--selected' : ''}`}
            key={number}
            onClick={() => onClickNumber(number.toString())}
          >
            {number}
          </div>
        ))
      }
    </div>
  );
};
