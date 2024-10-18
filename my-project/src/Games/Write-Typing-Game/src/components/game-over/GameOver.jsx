// GameOver.jsx
const GameOver = ({ onRestart }) => {
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const popupStyle = {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.2)",
    maxWidth: "400px",
    width: "80%",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "15px",
  };

  const buttonStyle = {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: "#0056b3",
  };

  return (
    <div style={overlayStyle}>
      <div style={popupStyle}>
        <div style={titleStyle}>Game Over</div>
        <button
          style={buttonStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#007BFF")}
          onClick={onRestart}
        >
          Restart Game
        </button>
      </div>
    </div>
  );
};

export default GameOver;
