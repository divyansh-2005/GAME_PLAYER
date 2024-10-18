import styles from '../styles/Stats.module.css';

export default function Stats({ level, score, highestScore }) {
    const inlineStyles = {
        h2: {
            fontSize: '2.5rem',
            fontWeight: '700',
            color:"white",
            backgroundColor: 'transparent',
            position:"relative"
        },
        h3: {
            fontSize: '1.8rem',
            fontWeight: '500',
            color:"white",
            backgroundColor: 'transparent',
            position:"relative"
        },
        hr: {
            width: '100%',
            borderRadius: '10px',
            height: '5px',
            background: 'linear-gradient(to right, #d16ba5, #c777b9, #ba83ca, #aa8fd8, #9a9ae1, #8aa7ec, #79b3f4, #69bff8, #52cffe, #41dfff, #46eefa, #5ffbf1)',
            border: 'none',
            position: 'fixed', // Make it fixed position
            bottom: '0', // Position it at the bottom
            left: '0',
        }
    };

    return (
        <div className={styles.stats}>
            <h2 style={inlineStyles.h2}>Level: {level}</h2>
            <div className={styles.scoreContainer}>
                <h3 style={inlineStyles.h3}>Score: {score}</h3>
                <h3 style={inlineStyles.h3}>Highest Score: {highestScore}</h3>
            </div>
            <hr style={inlineStyles.hr} />
        </div>
    );
}
