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
Analyze the user's request and suggest 4-6 relevant sections or field groups for a form.
Each suggestion must have: id (snake_case), title, description, and suggestedFields (array of 2-3 strings).
Return ONLY a valid JSON array. No markdown, no explanation, just the raw JSON array.
Example:
[{"id":"donor_details","title":"Donor Details","description":"Collect donor information.","suggestedFields":["Full Name","Email","Phone"]}]`
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1024,
        });

        const text = completion.choices[0]?.message?.content || "";
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("Failed to parse AI response as JSON");
        const suggestions = JSON.parse(jsonMatch[0]);
        res.json(suggestions);
    } catch (error) {
        console.error("AI Intent Analysis Error:", error.message);
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
- Return ONLY the raw JSON array, no markdown, no explanation.
Example: [{"title":"Your name","type":"short_answer"},{"title":"Rate experience","type":"scale"},{"title":"Choose one","type":"multiple_choice","options":["A","B","C"]}]`
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
        console.log("AI raw response:", text.substring(0, 300));

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("AI did not return a valid JSON array");

        const questions = JSON.parse(jsonMatch[0]);

        // Build proper Google Forms batchUpdate requests server-side
        const requests = questions.map((q, i) => ({
            createItem: {
                item: {
                    title: q.title,
                    questionItem: {
                        question: {
                            required: false,
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
        console.error("AI Form Structure Generation Error:", error.message);
        res.status(500).json({ message: "Failed to generate form structure", error: error.message });
    }
};

module.exports = { analyzeIntent, generateFormStructure };
