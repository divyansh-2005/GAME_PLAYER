import React from "react";

const Screen = ({ score, startGame }) => {
    return (
        <div
            style={{
                color: "#fff",
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            {score > 0 ? (
                <>
                    <h4 style={{ fontSize: "42px", margin: "8px 12px", padding: 0 }}>SCORE</h4>
                    <h4 style={{ fontSize: "42px", margin: "8px 12px", padding: 0 }}>{score}</h4>
                    <button
                        style={{
                            fontSize: "small",
                            marginTop: "20px",
                            height: "53px",
                            width: "135px",
                            borderRadius: "227px",
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            border: "2px #fff solid",
                            color: "#fff",
                        }}
                        onClick={() => startGame()}
                        onMouseOver={(e) => e.target.style.backgroundColor = "rgba(0, 0, 0, 0.6)"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "rgba(0, 0, 0, 0.3)"}
                    >
                        Play Again
                    </button>
                </>
            ) : (
                <>
                    <p
                        className="text--glitch"
                        data-text="Stack Game"
                        style={{
                            textAlign: "center",
                            margin: 0,
                            color: "white",
                            fontSize: "6rem",
                            fontWeight: 700,
                            position: "relative",
                            letterSpacing: "0.025em",
                            textTransform: "uppercase",
                            textShadow:
                                "0.05em 0 0 rgba(255, 0, 0, 0.75), -0.05em -0.025em 0 rgba(0, 255, 0, 0.75), 0.025em 0.05em 0 rgba(0, 0, 255, 0.75)",
                            animation: "glitch 525ms infinite",
                        }}
                    >
                        Stack Game
                    </p>
                    <button
                        style={{
                            fontSize: "small",
                            marginTop: "20px",
                            height: "53px",
                            width: "135px",
                            borderRadius: "227px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            border: "2px #fff solid",
                            color: "#fff",
                        }}
                        onClick={() => startGame()}
                        onMouseOver={(e) => e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)"}
                    >
                        START
                    </button>
                </>
            )}
        </div>
    );
};

export default Screen;
