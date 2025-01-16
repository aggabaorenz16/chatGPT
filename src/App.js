import React, { useState, useEffect } from "react";
import "./App.css";
// Backend Integration: Google Generative AI SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Use environment variable or hardcoded API key for access
const apiKey = "AIzaSyD4u7vPpj8L9h2SjEr48-L6uXIa66VLqW0";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

// Generation Configuration
const generationConfig = {
  temperature: 0.65,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Function to get AI response
async function getAIResponse(input) {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [{ text: "Who's Renz Abellanosa Aggabao?" }],
        },
        {
          role: "model",
          parts: [
            {
              text: "This React application, integrating Google Generative AI, was created by Renz Abellanosa Aggabao, a second-year student at Quezon City University, pursuing a Bachelor of Science in Information Technology.",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: input }],
        },
      ],
    });

    const result = await chatSession.sendMessage(input);
    return result.response.text();
  } catch (error) {
    console.error("Error fetching AI response:", error);
    throw new Error(`Error: ${error.message}`);
  }
}

// React Frontend Application
function App() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Save messages to localStorage when updated
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  // Handle form submission to send user input
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, user: true }]);
    setLoading(true);

    try {
      const response = await getAIResponse(input);
      setMessages((prev) => [...prev, { text: response, user: false }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: `Error: ${error.message}`, user: false },
      ]);
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  // Clear chat history
  const handleDeleteMessages = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
  };

  // Handle About Modal
  const toggleAboutModal = () => setShowAboutModal(!showAboutModal);

  return (
    <div className="App">
      <div className="chat-window">
        {/* Message Display */}
        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={message.user ? "message user" : "message bot"}
            >
              {message.text}
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            Send
          </button>
        </form>

        {/* Conditionally render the "Delete Messages" button */}
        {messages.length > 0 && (
          <button onClick={handleDeleteMessages} className="delete-button">
            Delete Messages
          </button>
        )}

        {/* About Icon Button */}
        <button onClick={toggleAboutModal} className="about-button">
          <i className="material-icons">info</i> {/* Material Icon for "About" */}
        </button>

        {/* About Modal */}
        {showAboutModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={toggleAboutModal}>
                &times;
              </span>
              <h2>About</h2>
              <p>
                This React application integrates Google Generative AI to provide answers to users' questions. It was created by Renz Abellanosa Aggabao, a second-year student at Quezon City University, pursuing a Bachelor of Science in Information Technology.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
