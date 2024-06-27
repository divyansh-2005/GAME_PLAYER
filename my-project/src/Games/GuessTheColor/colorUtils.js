// src/utils/colorUtils.js

export const generateRandomColors = (num) => {
    const arr = [];
    for (let i = 0; i < num; i++) {
      arr.push(makeColor());
    }
    return arr;
  };
  
  export const chooseColor = (colors) => {
    const random = Math.floor(Math.random() * colors.length);
    return colors[random];
  };
  
  const makeColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  };
  