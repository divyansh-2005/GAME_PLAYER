export const simulateKeyPress = (key) => {
    return () => {
        const event = new KeyboardEvent('keydown', {
            key,
            bubbles: true,
        });
        document.dispatchEvent(event);
    };
};