require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listAllModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        // The SDK doesn't have listModels directly on GenAI object in some versions, 
        // it's usually done via a different client or by checking the error.
        // But let's try a different approach: check if we can reach the API at all.
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("test");
        const response = await result.response;
        console.log("SUCCESS:", response.text());
    } catch (error) {
        console.log("ERROR_MESSAGE:", error.message);
        if (error.status) console.log("STATUS:", error.status);
    }
}

listAllModels();
