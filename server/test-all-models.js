require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    const apiKey = process.env.GEMINI_API_KEY;
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

    for (const m of models) {
        console.log(`TESTING_${m}`);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("ping");
            const response = await result.response;
            console.log(`SUCCESS_${m}: ${response.text().substring(0, 10)}`);
            break;
        } catch (e) {
            console.log(`FAILED_${m}: ${e.message}`);
        }
    }
}
run();
