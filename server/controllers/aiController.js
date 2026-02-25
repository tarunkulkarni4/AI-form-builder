const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const analyzeIntent = async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are an expert Google Forms designer. 
Analyze the user's request and suggest 4-6 relevant sections for a form.
Each suggestion must have: id (snake_case), title, description, and suggestedFields (array of 2-3 strings).
Return ONLY a valid JSON array. No markdown, no explanation.`
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1024,
        });

        const text = completion.choices[0]?.message?.content || "";
        console.log("AI Intent Response Length:", text.length);

        let suggestions = [];
        try {
            const startIdx = text.indexOf('[');
            const endIdx = text.lastIndexOf(']');
            if (startIdx === -1 || endIdx === -1) throw new Error("Missing brackets");
            suggestions = JSON.parse(text.substring(startIdx, endIdx + 1));
        } catch (parseErr) {
            console.error("Intent Parse Error. Raw text:", text);
            throw new Error("Failed to parse intent AI response");
        }

        res.json(suggestions);
    } catch (error) {
        console.error("AI Intent Analysis Error:", error);
        res.status(500).json({ message: "Failed to analyze intent", error: error.message });
    }
};

// Converts a simple question type string into a Google Forms API question object
const buildQuestion = (type, options = []) => {
    switch (type) {
        case 'paragraph':
            return { textQuestion: { paragraph: true } };
        case 'multiple_choice':
            return { choiceQuestion: { type: "RADIO", options: options.map(v => ({ value: v })) } };
        case 'checkbox':
            return { choiceQuestion: { type: "CHECKBOX", options: options.map(v => ({ value: v })) } };
        case 'dropdown':
            return { choiceQuestion: { type: "DROP_DOWN", options: options.map(v => ({ value: v })) } };
        case 'scale':
            return { scaleQuestion: { low: 1, high: 5, lowLabel: "Poor", highLabel: "Excellent" } };
        default: // short_answer
            return { textQuestion: { paragraph: false } };
    }
};

const generateFormStructure = async (req, res) => {
    const { prompt, sections } = req.body;
    if (!prompt || !sections) return res.status(400).json({ message: "Prompt and sections are required" });

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are a form designer. Return a compact JSON array of questions.
Each question: {"title":"...", "type":"short_answer|paragraph|multiple_choice|checkbox|dropdown|scale", "options":["opt1","opt2"]}
- Use "options" only for multiple_choice, checkbox, dropdown (2-4 options each).
- Generate exactly 2-3 questions per section.
- Return ONLY the raw JSON array, no markdown, no explanation.`
                },
                {
                    role: "user",
                    content: `Form topic: "${prompt}"\nSections: ${JSON.stringify(sections.map(s => s.title))}\nGenerate 2-3 questions per section.`
                }
            ],
            temperature: 0.3,
            max_tokens: 2048,
        });

        const text = completion.choices[0]?.message?.content || "";
        console.log("AI Raw Response Length:", text.length);

        // More robust JSON extraction
        let questions = [];
        try {
            const startIdx = text.indexOf('[');
            const endIdx = text.lastIndexOf(']');
            if (startIdx === -1 || endIdx === -1) {
                console.error("AI Response without brackets:", text);
                throw new Error("AI did not return a valid JSON array (missing brackets)");
            }
            const jsonStr = text.substring(startIdx, endIdx + 1);
            questions = JSON.parse(jsonStr);
        } catch (parseErr) {
            console.error("JSON Parse Error. Raw text:", text);
            throw new Error("Failed to parse AI response: " + parseErr.message);
        }

        // Build proper Google Forms batchUpdate requests server-side
        const requests = questions.map((q, i) => ({
            createItem: {
                item: {
                    title: q.title || "Untitled Question",
                    questionItem: {
                        question: {
                            required: true,
                            ...buildQuestion(q.type, q.options || [])
                        }
                    }
                },
                location: { index: i }
            }
        }));

        console.log(`Built ${requests.length} form items successfully`);
        res.json({ requests });

    } catch (error) {
        console.error("AI Form Structure Generation ERROR:", error);
        res.status(500).json({
            message: "Failed to generate form structure",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

module.exports = { analyzeIntent, generateFormStructure };
