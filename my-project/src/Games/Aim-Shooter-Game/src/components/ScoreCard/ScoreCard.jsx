import React from "react";
import Score from "../../assets/Score.png";
import styles from "../../App.module.css";

const ScoreStyle = {
  position: "absolute",
  top: "38%",
  left: "45%",
  transform: "translate(-50%, -50%)",
  color: "white",
  fontSize: "2.25rem ",
  textAlign: "center",
};

function ScoreCard({ score }) {
  return (
    <div className={styles.score}>
      <img src={Score} alt="score" />
      <div style={ScoreStyle}>
        <span style={{ fontSize: "1.125rem" }}> Score: </span> <br />
        {score}
      </div>
    </div>
  );
}

export default ScoreCard;
