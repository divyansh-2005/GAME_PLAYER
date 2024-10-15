export default function Title() {
    const styles = {
        titleColormemo: {
            paddingTop: '10px',
            textAlign: 'center',
            backgroundColor: 'transparent', // Set background to transparent
        },
        title: {
            fontSize: '3.5rem',
            fontWeight: '900',
            backgroundColor: 'transparent', // Ensure no background color here
        },
        firstPart: {
            backgroundImage: 'linear-gradient(to right, #d16ba5, #c777b9, #ba83ca, #aa8fd8, #9a9ae1, #8aa7ec, #79b3f4, #69bff8, #52cffe, #41dfff, #46eefa, #5ffbf1)',
            backgroundSize: '100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            MozBackgroundClip: 'text',
            MozTextFillColor: 'transparent',
            textTransform: 'uppercase', // Transform text to uppercase
        },
        secondPart: {
            WebkitTextFillColor: 'transparent',
            MozTextFillColor: 'transparent',
            WebkitTextStroke: '2px #86A8E7',
            textTransform: 'uppercase', // Transform text to uppercase
        },
    };

    return (
        <div style={styles.titleColormemo}>
            <h1 style={styles.title}>
                <span style={styles.firstPart}>Colour </span>
                <span style={styles.secondPart}>Memo</span>
            </h1>
        </div>
    );
}
