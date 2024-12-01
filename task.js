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

// Define a detailed FAQ for common queries
const FAQ = [
  {
    question: "How to become a President University student?",
    answer:
      "Hi there! For admission, you can fill out the online application form at our website: https://www.president.ac.id. Let me know if you'd like further guidance!",
  },
  {
    question: "What programs does President University offer?",
    answer:
      "President University offers a wide range of programs in fields like Engineering, IT, Business, and more. You can explore the full list here: https://www.president.ac.id/programs.",
  },
  {
    question: "Can I apply for scholarships?",
    answer:
      "Yes, President University provides various scholarships. You can learn more and check your eligibility at https://www.president.ac.id/scholarships.",
  },
];

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
        text: `You are a customer service agent for President University. Answer all questions accurately and politely, based on the information provided below. Always offer links to official resources for more details. If unsure, ask the user to refer to the university website or contact customer service directly.

## FAQ:
${FAQ.map((item, index) => `${index + 1}. "${item.question}" Answer: "${item.answer}"`).join("\n")}`,
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

  try {
    // Send the received message to the AI
    const result = await chat.sendMessage(msg.body);
    const response = await result.response;
    const aiResponse = await response.text();

    // Reply with the AI response
    msg.reply(aiResponse);
  } catch (error) {
    console.error("Error responding to the message:", error);
    msg.reply(
      "I'm sorry, there was an issue processing your request. Please try again later or visit https://www.president.ac.id for assistance."
    );
  }
});

// Initialize the WhatsApp client
client.initialize();
