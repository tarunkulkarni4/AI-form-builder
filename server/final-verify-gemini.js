require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function verifyFinalVersion() {
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Say 'AI works!'");
        const response = await result.response;
        console.log("FINAL_VERIFICATION_SUCCESS:", response.text());
        process.exit(0);
    } catch (error) {
        console.error("FINAL_VERIFICATION_FAILED:", error.message);
        process.exit(1);
    }
}
verifyFinalVersion();
