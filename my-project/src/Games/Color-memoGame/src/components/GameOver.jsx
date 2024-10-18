export default function GameOver({ highestScore, overlayStyle, modalStyle, resetGame }) {
    // Internal CSS styles
    const styles = {
        overlay: {
            position: 'fixed',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)', // Darker overlay
            zIndex: 100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center', // Center modal vertically
            transition: '0.2s opacity ease-in-out',
        },
        modal: {
            backgroundColor: '#fff', // Lighter background for better contrast
            color: 'rgb(32, 32, 32)',
            maxWidth: '400px', // Set a max width for the modal
            width: '90%', // Make it responsive
            padding: '30px', // More padding for better spacing
            borderRadius: '10px', // Slightly more rounded corners
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            transition: '0.2s transform ease-in-out',
        },
        button: {
            fontSize: '1.2rem',
            padding: '15px 30px', // More padding
            cursor: 'pointer',
            border: 'none',
            color: '#fff',
            fontWeight: 700,
            borderRadius: '5px', // Less rounded corners
            backgroundColor: '#d16ba5',
            transition: 'background-color 0.2s', // Smooth transition
        },
        buttonHover: {
            backgroundColor: '#ba83ca', // Change background color on hover
        },
        h2: {
            fontSize: '2.5rem', // Slightly larger font size
            backgroundColor: 'transparent', // Prevent background color conflict
        },
        h3: {
            fontSize: '1.8rem', // Slightly larger font size
            backgroundColor: 'transparent', // Prevent background color conflict
        },
        p: {
            color: 'rgb(32, 32, 32)', // Use your preferred color
            backgroundColor: 'transparent', // Prevent background color conflict
        },
    };

    return (
        <div id="overlay" style={{ ...styles.overlay, ...overlayStyle }}>
            <div id="game-over-modal" style={{ ...styles.modal, ...modalStyle,position:"absolute",top:"80px" }} >
                <h2 style={styles.h2}>You lost...</h2>
                <h3 style={styles.h3}>Highest Score: {highestScore}</h3>
                <p style={styles.p}>You clicked the same color twice.</p>
                <button 
                    style={styles.button} 
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
                    onClick={resetGame}
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
