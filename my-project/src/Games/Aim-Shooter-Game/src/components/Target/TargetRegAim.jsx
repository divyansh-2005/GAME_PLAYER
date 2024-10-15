import React, { useEffect, useState } from "react";
import zombie1 from "../../assets/1.png";
import zombie2 from "../../assets/3.png";
import zombie3 from "../../assets/4.png";
import zombie4 from "../../assets/2.png";
import styles from "../../App.module.css"

function TargetRegAim({ score, setScore }) {
  const zombieArray = [zombie1, zombie2, zombie3, zombie4];
  let zombie = 0;
  const [xCoord, setxCoord] = useState(300);
  const [yCoord, setyCoord] = useState(300);
  const [zombieFace, setZombieFace] = useState(zombieArray[zombie]);
  const [timerId, setTimerId] = useState(null);

  let x = window.innerWidth - 120;
  let y = window.innerHeight - 150;

  console.log(xCoord, yCoord);

  const zombieSwitch = () => {
    setxCoord(Math.floor(Math.random() * (x - 20) + 20));
    setyCoord(Math.floor(Math.random() * (y - 50) + 50));

    zombie = Math.floor(Math.random() * 4);
    setZombieFace(zombieArray[zombie]);
  };

  useEffect(() => {
    if (timerId) {
      clearTimeout(timerId);
    }

    const newTimerId = setInterval(() => {
      // Fire your function here
      zombieSwitch();
    }, 2000);

    setTimerId(newTimerId);

    return () => {
      clearInterval(newTimerId);
    };
  }, [score]);

  const resetTimer = () => {
    if (timerId) {
      clearInterval(timerId);
    }

    const newTimerId = setInterval(() => {}, 2000);

    setTimerId(newTimerId);
    zombieSwitch();
  };

  const handleScore = () => {
    setScore((prev) => prev + 1);
    resetTimer();
  };

  const buttonStyle = {
    position: "absolute",
    top: yCoord,
    left: xCoord,
    height: "fit-content",
    width: "fit-content",
    border: "none",
    backgroundImage: zombie1,
  };

  return (
    <div style={buttonStyle} onClick={handleScore} className={styles["button"]}>
      <img src={zombieFace} alt="Zombie" />
    </div>
  );
}

export default TargetRegAim;
