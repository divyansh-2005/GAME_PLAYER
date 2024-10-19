import React from "react";

interface Props {
  key: string;
  isHeld: boolean;
  value: number;
  holdDice: () => object | void;
}

const Die= (props) => {
  const styles = {
    backgroundColor: props.isHeld ? "rgba(247, 182, 41, 0.9)" : "white",
  };

  function face() {
    switch (props.value) {
      case 1:
        return (
          <div className="dice first-face" style={styles}>
            <span className="dot"></span>
          </div>
        );
      case 2:
        return (
          <div className="dice second-face" style={styles}>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        );
      case 3:
        return (
          <div className="dice third-face" style={styles}>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        );
      case 4:
        return (
          <div className="fourth-face dice" style={styles}>
            <div className="column">
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
            <div className="column">
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="fifth-face dice" style={styles}>
            <div className="column">
              <span className="dot"></span>
              <span className="dot"></span>
            </div>

            <div className="column">
              <span className="dot"></span>
            </div>

            <div className="column">
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="sixth-face dice" style={styles}>
            <div className="column">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
            <div className="column">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="die-face" onClick={props.holdDice}>
      {face()}
    </div>
  );
};

export default Die;

