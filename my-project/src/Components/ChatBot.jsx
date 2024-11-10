import React, { useState } from "react";
// import "./Chatbot.css"; // You can style the chatbot using this file

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false); // Toggle chatbot visibility
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can I assist you today?" },
  ]);
  const [userInput, setUserInput] = useState("");

  const predefinedQA = {
    "What games do you have?":
      "We currently offer games like Whack-a-Mole, Simon Says, and Number Guessing.",
    "How do I play Whack-a-Mole?":
      "In Whack-a-Mole, click on the moles as they appear before they disappear to earn points.",
    "How can I reset the game?":
      "You can reset the game by pressing the 'Start Game' button after the game is over.",
    "What is Simon Says?":
      "Simon Says is a memory game where you have to repeat the color sequence shown.",
  };

  const handleSendMessage = () => {
    const userMessage = userInput.trim();

    if (userMessage) {
      setMessages((prev) => [...prev, { from: "user", text: userMessage }]);

      const botResponse = predefinedQA[userMessage]
        ? predefinedQA[userMessage]
        : "I'm sorry, I don't understand that question.";

      setMessages((prev) => [...prev, { from: "bot", text: botResponse }]);
    }

    setUserInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Fixed image button at the bottom of the screen */}
      <img
        src="bot.jpg"
        alt="Chat Icon"
        style={styles.toggleButton}
        onClick={toggleChatbot}
      />

      {isOpen && (
        <div style={styles.chatbotContainer}>
          <h3 style={{ fontSize: "1.5rem" }}>Gamebot</h3>
          <div style={styles.chatWindow}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={
                  message.from === "bot"
                    ? styles.botMessage
                    : styles.userMessage
                }
              >
                {message.text}
              </div>
            ))}
          </div>

          <div style={styles.inputContainer}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              style={styles.input}
              placeholder="Ask me a question..."
            />
            <button onClick={handleSendMessage} style={styles.sendButton}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Styles
const styles = {
  chatbotContainer: {
    position: "fixed",
    bottom: "80px", // 60px above the bottom image
    right: "20px",
    width: "300px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    padding: "10px",
    zIndex: "10001",
  },
  chatWindow: {
    height: "300px",
    overflowY: "auto",
    marginBottom: "10px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
  },
  botMessage: {
    fontSize: "1.1rem",
    textAlign: "left",
    padding: "10px",
    margin: "5px 0",
    backgroundColor: "#e0e0e0",
    borderRadius: "8px",
  },
  userMessage: {
    fontSize: "1.1rem",
    textAlign: "right",
    padding: "10px",
    margin: "5px 0",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "8px",
  },
  inputContainer: {
    display: "flex",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    marginRight: "10px",
    fontSize: "1rem",
  },
  sendButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    fontSize: "1.25rem",
  },
  toggleButton: {
    borderRadius: "100%",
    position: "fixed",
    bottom: "20px",
    right: "80px",
    width: "50px",
    height: "50px",
    cursor: "pointer",
    zIndex: 1000,
  },
};

export default ChatBot;
