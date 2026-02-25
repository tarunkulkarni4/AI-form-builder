require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY missing in .env");
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // The current SDK might not have a direct listModels, 
        // but we can try to fetch a common one or check the error response again.
        // Actually, let's try gemini-1.5-pro or gemini-pro (legacy)

        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

        for (const modelName of modelsToTry) {
            console.log(`--- Testing model: ${modelName} ---`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("test");
                const response = await result.response;
                console.log(`✅ Success with ${modelName}:`, response.text().substring(0, 20) + "...");
                process.exit(0);
            } catch (err) {
                console.error(`❌ Failed with ${modelName}:`, err.message);
            }
        }
    } catch (error) {
        console.error("❌ Major failure:", error.message);
    }
}

listModels();
