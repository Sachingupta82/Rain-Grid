// test-gemini.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  try {
    console.log("Testing Gemini API connection...");
    console.log("API Key exists:", !!process.env.GEMINI_API_KEY);
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent("Say hello in one word");
    const response = await result.response;
    console.log("API Response:", response.text());
    console.log("✅ Gemini API is working!");
    
  } catch (error) {
    console.error("❌ Gemini API test failed:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

testGemini();