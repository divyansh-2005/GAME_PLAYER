import React, { useState, useEffect } from 'react';
import './TowerOfHanoi.css';
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Back from '../../Components/Back';
import Confetti from 'react-confetti'; // Import confetti component

const TowerOfHanoi = () => {
  const [towers, setTowers] = useState([[], [], []]);
  const [numRings, setNumRings] = useState(3);
  const [moveCounter, setMoveCounter] = useState(0);
  const [selectedDisk, setSelectedDisk] = useState(null);
  const [minMoves, setMinMoves] = useState(0);
  const [win, setWin] = useState(false); // State to track win

  useEffect(() => {
    setupTowers();
  }, [numRings]);

  const setupTowers = () => {
    let initialTowers = [[], [], []];
    for (let i = numRings; i > 0; i--) {
      initialTowers[0].push(i);
    }
    setTowers(initialTowers);
    setMoveCounter(0);
    setMinMoves(Math.pow(2, numRings) - 1); // Calculate min possible moves
    setWin(false); // Reset win state
  };

  const changeNumRings = (delta) => {
    const newValue = Math.max(1, Math.min(8, numRings + delta));
    setNumRings(newValue);
  };

  const createDisk = (size, diskIndex) => {
    const diskStyles = {
      width: `${size * 26}px`,
      bottom: `${diskIndex * 20}px`,
      backgroundColor: getColor(size),
    };
    return (
      <div
        key={size}
        className="disk"
        style={diskStyles}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, size)}
      >
      </div>
    );
  };

  const getColor = (size) => {
    const colors = [
      'rgba(173, 216, 230)', // lightblue
      'rgba(255, 182, 193)', // lightpink
      'rgba(144, 238, 144)', // lightgreen
      'rgba(255, 165, 0)',   // orange
      'rgba(255, 255, 0)',   // yellow
      'rgba(221, 160, 221)', // plum
      'rgba(255, 99, 71)',   // tomato
      'rgba(135, 206, 250)', // lightskyblue
    ];
    return colors[size - 1] || 'rgba(173, 216, 230, 0.7)';
  };

  const handleDragStart = (e, size) => {
    const towerIndex = towers.findIndex(tower => tower.includes(size));
    setSelectedDisk({ size, tower: towerIndex });
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetTowerIndex) => {
    e.preventDefault();
    if (selectedDisk === null) return;

    const from = selectedDisk.tower;
    moveDisk(from, targetTowerIndex);
    setSelectedDisk(null);
  };

  const moveDisk = (from, to) => {
    const disk = towers[from].slice(-1)[0];
    if (towers[to].length === 0 || disk < towers[to].slice(-1)[0]) {
      let newTowers = [...towers];
      newTowers[from] = newTowers[from].slice(0, -1);
      newTowers[to] = [...newTowers[to], disk];
      setTowers(newTowers);
      setMoveCounter(moveCounter + 1);
    }
  };

  const checkWin = () => {
    if (towers[2].length === numRings) {
      setWin(true); // Set win state to true
    }
  };

  useEffect(() => {
    checkWin();
  }, [towers]);

  const startGame = () => {
    setupTowers();
  };

  return (
    <>
      <Header />
      <Back />
      <div className="Hanoi">
        {win && <Confetti />} {/* Show confetti when won */}
        {win && <h2 className="win-message">You won!</h2>} {/* Win message */}
        <h1 className="heading">Tower of Hanoi</h1>
        <div className="controls">
          <label htmlFor="numRings">Disks:</label>
          <div className="number-input">
            <button onClick={() => changeNumRings(-1)} id="minus_button">-</button>
            <input type="number" id="numRings" min="1" max="8" value={numRings} readOnly />
            <button onClick={() => changeNumRings(1)} id="plus_button">+</button>
          </div>
          <button onClick={startGame} className="restart">Restart</button>
        </div>
        <p>Moves: <span id="moveCounter">{moveCounter}</span></p>
        <p>Min. Moves: <span id="min_moves">{minMoves}</span></p>
        <div className="container">
          {towers.map((tower, index) => (
            <div
              key={index}
              className="tower"
              onDragOver={allowDrop}
              onDrop={(e) => handleDrop(e, index)}
            >
              {tower.map((diskSize, idx) => createDisk(diskSize, idx))}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TowerOfHanoi;
