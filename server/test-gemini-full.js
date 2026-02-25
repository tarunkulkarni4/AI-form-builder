require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGeminiFull() {
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        await model.generateContent("test");
    } catch (error) {
        console.log("FULL_ERROR_START");
        console.log(error);
        console.log("FULL_ERROR_END");
        process.exit(0);
    }
}

testGeminiFull();
