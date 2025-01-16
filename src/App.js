import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Importing the Google Generative AI SDK (Ensure it's installed)
const { GoogleGenerativeAI } = require('@google/generative-ai');

function App() {
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage when the component mounts
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Save messages to localStorage whenever they change
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (input.trim()) {
      setMessages([...messages, { text: input, user: true }]);

      // Get AI response using the Google Generative API
      setLoading(true); // Set loading state while waiting for the response
      const response = await getAIResponse(input);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: response, user: false },
      ]);
      setInput('');
      setLoading(false); // Reset loading state once the response is received
    }
  };

  // Function to get AI response using Google Generative API (via SDK)
  const getAIResponse = async (input) => {
    try {
      const apiKey = "AIzaSyD4u7vPpj8L9h2SjEr48-L6uXIa66VLqW0"; // Use environment variable for API key
      const genAI = new GoogleGenerativeAI(apiKey);

      // Define the model configuration
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      // Set up the generation configuration
      const generationConfig = {
        temperature: 0.65,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      };

      // Start the chat session
      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [{ text: input }],
          },
        ],
      });

      // Send the message to the model and get the response
      const result = await chatSession.sendMessage(input);
      return result.response.text();
    } catch (error) {
      console.error('Error fetching AI response:', error);
      return `Error: ${error.message}`; // Return error message if generation fails
    }
  };

  const handleDeleteMessages = () => {
    setMessages([]); // Clear messages state
    localStorage.removeItem('chatMessages'); // Clear messages from localStorage
  };

  return (
    <div className="App">
      <div className="chat-window">
        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={message.user ? 'message user' : 'message bot'}
            >
              {message.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit" disabled={loading}>Send</button>
        </form>
        <button onClick={handleDeleteMessages} className="delete-button">
          Delete Messages
        </button>
      </div>
    </div>
  );
}

export default App;
