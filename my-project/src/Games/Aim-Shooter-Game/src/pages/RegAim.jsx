import React, { useEffect, useState } from "react";
import styles from  "../App.module.css";
import gunFire from "../assets/9mm.mp3";
import ScoreCard from "../components/ScoreCard/ScoreCard";
import Timer from "../components/ScoreCard/Timer";
import TargetRegAim from "../components/Target/TargetRegAim";
import Result from "./Result";

function RegAim() {
  const [score, setScore] = useState(0);
  const fire = () => {
    new Audio(gunFire).play();
  };

  const [countdown, setCountdown] = useState(30);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (countdown === 0) {
      setGameOver(true);
    } else {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <>
      {gameOver ? (
        <Result score={score} />
      ) : (
        <div className={styles.container} onClick={fire}>
          <ScoreCard score={score} />
          <Timer timer={countdown} />
          <TargetRegAim score={score} setScore={setScore} />
        </div>
      )}
    </>
  );
}

export default RegAim;
