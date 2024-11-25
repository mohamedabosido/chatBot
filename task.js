import dotenv from "dotenv";
dotenv.config();
import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import readline from "readline";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Initialize the WhatsApp client
const client = new Client();

// Create a read/write interface for user inputs
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Listen for WhatsApp QR code for authentication
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Start the bot once WhatsApp client is ready
client.on("ready", () => {
  console.log("Client is ready!");
});

// Set up the AI chat history and model
const chatHistory = [
  {
    role: "user",
    parts: [
      {
        text: "I am interested in learning more about President University's programs and services. Can you provide me with more information?",
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: "You are a customer service agent for President University. Answer all questions with accurate information about the university's services, programs, and procedures. If you are unsure, ask the user to refer to the university website or contact customer service directly.",
      },
    ],
  },
];

// Create the AI chat model
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const chat = model.startChat({
  history: chatHistory,
  generationConfig: {
    maxOutputTokens: 200,
  },
});

// Define message handling from WhatsApp
client.on("message", async (msg) => {
  if (msg.body.toLowerCase() === "exit") {
    msg.reply("Goodbye! Feel free to reach out again if you need assistance.");
    return;
  }

  // Send the received message to the AI
  const result = await chat.sendMessage(msg.body);
  const response = await result.response;
  const aiResponse = await response.text();

  // Reply with the AI response
  msg.reply(aiResponse);
});

// Initialize the WhatsApp client
client.initialize();
