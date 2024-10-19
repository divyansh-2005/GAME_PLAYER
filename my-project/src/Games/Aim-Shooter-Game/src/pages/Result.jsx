import React from "react";
import styles from "../App.module.css"

function Result({ score }) {
  return (
    <div className={styles["result-container"]}>
      <div> Your Score is {score} </div>
      <div> Average kill per second : {(score / 15).toFixed(2)} </div>
      <div>
        Your aim is
        {score > 7 ? (
          <span style={{ color: "green" }}> Good </span>
        ) : (
          <span style={{ color: "red" }}> Not Good Enough </span>
        )}
      </div>
      <button
        className={styles["start-button"]}
        onClick={() => window.location.reload(true)}
      >
        Go to home
      </button>
    </div>
  );
}

export default Result;
