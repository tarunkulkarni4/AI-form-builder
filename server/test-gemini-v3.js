require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Testing with key snippet:", apiKey.substring(0, 10));

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say 'Success!'");
        const response = await result.response;
        console.log("RESULT_START");
        console.log(response.text());
        console.log("RESULT_END");
    } catch (error) {
        console.error("DIAGNOSTIC_FAILED");
        console.error(error.message);
    }

    // Keep process alive briefly to ensure output is flushed and avoid UV_HANDLE_CLOSING crash
    setTimeout(() => {
        process.exit(0);
    }, 2000);
}

testGemini();
