const { GoogleGenerativeAI } = require("@google/generative-ai");
const readlineSync = require("readline-sync");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat history to maintain context
const chatHistory = [];

// Function to run the chat
async function runChat() {
  try {
    console.log("Gemini Chat Interface");
    console.log("Type 'exit' to end the conversation\n");

    // Create a chat model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    while (true) {
      // Get user input
      const userInput = readlineSync.question("\nYou: ");
      
      // Check if user wants to exit
      if (userInput.toLowerCase() === "exit") {
        console.log("\nGoodbye! Chat session ended.");
        break;
      }

      // Add user message to history
      chatHistory.push({ role: "user", parts: [{ text: userInput }] });
      
      console.log("\nGemini is thinking...");
      
      // Get response from Gemini
      const result = await chat.sendMessage(userInput);
      const response = result.response.text();
      
      // Add AI response to history
      chatHistory.push({ role: "model", parts: [{ text: response }] });
      
      // Display the response
      console.log(`\nGemini: ${response}`);
    }
  } catch (error) {
    console.error("Error in chat:", error);
  }
}

// Start the chat
runChat(); 