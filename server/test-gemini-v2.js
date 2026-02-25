require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY missing in .env");
        process.exit(1);
    }

    console.log("Testing Gemini API with key:", apiKey.substring(0, 10) + "...");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("✅ Gemini API response received:", response.text());
        process.exit(0);
    } catch (error) {
        console.error("❌ Gemini API Test Failed:");
        console.error("Error Message:", error.message);
        process.exit(1);
    }
}

testGemini();
