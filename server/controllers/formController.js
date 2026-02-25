const { google } = require('googleapis');
const User = require('../models/User');
const Form = require('../models/Form');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Converts question type string to Google Forms question object
const buildQuestion = (type, options = []) => {
    switch (type) {
        case 'paragraph': return { textQuestion: { paragraph: true } };
        case 'multiple_choice': return { choiceQuestion: { type: 'RADIO', options: options.map(v => ({ value: v })) } };
        case 'checkbox': return { choiceQuestion: { type: 'CHECKBOX', options: options.map(v => ({ value: v })) } };
        case 'dropdown': return { choiceQuestion: { type: 'DROP_DOWN', options: options.map(v => ({ value: v })) } };
        case 'scale': return { scaleQuestion: { low: 1, high: 5, lowLabel: 'Poor', highLabel: 'Excellent' } };
        default: return { textQuestion: { paragraph: false } };
    }
};

const createGoogleForm = async (req, res) => {
    const { title, description, requests, config, userId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.accessToken) {
            return res.status(401).json({ message: 'No Google access token. Please log in again.' });
        }

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_CALLBACK_URL
        );

        auth.setCredentials({
            access_token: user.accessToken,
            refresh_token: user.refreshToken
        });

        // Auto-refresh the token if expired
        auth.on('tokens', async (tokens) => {
            if (tokens.access_token) {
                user.accessToken = tokens.access_token;
                if (tokens.refresh_token) user.refreshToken = tokens.refresh_token;
                await user.save();
                console.log('Access token refreshed successfully.');
            }
        });

        const forms = google.forms({ version: 'v1', auth });

        // 1. Create the Form
        const createRes = await forms.forms.create({
            requestBody: { info: { title: title || 'AI Generated Form' } }
        });

        const formId = createRes.data.formId;
        console.log('Form created with ID:', formId);

        // 2. Build batchUpdate requests: description first, then questions
        const batchRequests = [];

        // Set description if provided
        if (description) {
            batchRequests.push({
                updateFormInfo: {
                    info: { description },
                    updateMask: 'description'
                }
            });
            // Re-index question items to start after the updateFormInfo (which doesn't take an index)
        }

        // Add question items (re-index from 0 since updateFormInfo doesn't occupy an index)
        if (requests && requests.length > 0) {
            requests.forEach((r, i) => {
                if (r.createItem) r.createItem.location = { index: i };
                batchRequests.push(r);
            });
        }

        if (batchRequests.length > 0) {
            await forms.forms.batchUpdate({
                formId: formId,
                requestBody: { requests: batchRequests }
            });
        }

        // 3. Store Metadata in MongoDB
        const expiryDate = config?.expiryDate ? new Date(config.expiryDate) : null;
        if (expiryDate) {
            expiryDate.setHours(23, 59, 59, 999);
        }

        const newForm = new Form({
            userId: user._id,
            formId: formId,
            title: title || 'AI Generated Form',
            publicUrl: createRes.data.responderUri,
            editUrl: `https://docs.google.com/forms/d/${formId}/edit`,
            expiryDate: expiryDate,
            maxResponses: config?.maxResponses ? parseInt(config.maxResponses) : null
        });

        await newForm.save();
        res.json(newForm);
    } catch (error) {
        console.error('Google Forms Creation Error:', error.message);
        if (error.response) {
            console.error('Google API Response:', JSON.stringify(error.response.data, null, 2));
        }

        // Detect auth errors
        if (error.message?.includes('invalid_grant') || error.message?.includes('401') || error.code === 401) {
            return res.status(401).json({
                message: 'Google session expired. Please log out and log in again to reconnect your Google account.',
                error: 'AUTH_EXPIRED'
            });
        }

        res.status(500).json({ message: 'Failed to create Google Form', error: error.message });
    }
};

const getUserForms = async (req, res) => {
    const { userId } = req.params;
    try {
        const forms = await Form.find({ userId }).sort({ createdAt: -1 });

        // Optional: Dynamically update isActive if expiryDate is passed
        const now = new Date();
        const updatedForms = forms.map(form => {
            const isExpired = form.expiryDate && new Date(form.expiryDate) < now;
            // We don't necessarily update the DB here to keep it efficient, 
            // but we ensure the UI gets the correct status.
            return {
                ...form.toObject(),
                isExpired,
                isActive: isExpired ? false : form.isActive
            };
        });

        res.json(updatedForms);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch forms' });
    }
};

const deleteForm = async (req, res) => {
    const { id } = req.params;
    try {
        const form = await Form.findByIdAndDelete(id);
        if (!form) return res.status(404).json({ message: 'Form not found' });
        res.json({ message: 'Form deleted successfully' });
    } catch (error) {
        console.error('Delete Form Error:', error.message);
        res.status(500).json({ message: 'Failed to delete form' });
    }
};

const expandForm = async (req, res) => {
    const { id } = req.params;          // MongoDB _id of the form
    const { prompt, userId } = req.body;
    if (!prompt || !userId) return res.status(400).json({ message: 'Prompt and userId are required' });

    try {
        // 1. Fetch the form & user
        const form = await Form.findById(id);
        if (!form) return res.status(404).json({ message: 'Form not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.accessToken) return res.status(401).json({ message: 'No Google access token. Please log in again.' });

        // 2. Generate new questions via AI
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `You are expanding an existing Google Form. Generate 2-4 new questions based on the user's request.
Return ONLY a JSON array. Each item: {"title":"...","type":"short_answer|paragraph|multiple_choice|checkbox|dropdown|scale","options":["opt1","opt2"]}
Use "options" only for multiple_choice, checkbox, dropdown. No markdown, no explanation.`
                },
                { role: 'user', content: `Form title: "${form.title}"\nExpand with: "${prompt}"` }
            ],
            temperature: 0.4,
            max_tokens: 1024,
        });

        const text = completion.choices[0]?.message?.content || '';
        console.log('Expand AI Response:', text.substring(0, 200));

        let questions = [];
        try {
            const start = text.indexOf('[');
            const end = text.lastIndexOf(']');
            if (start === -1 || end === -1) throw new Error('No JSON array found');
            questions = JSON.parse(text.substring(start, end + 1));
        } catch (parseErr) {
            console.error('Expand Parse Error:', text);
            throw new Error('Failed to parse AI response: ' + parseErr.message);
        }

        // 3. Setup Google auth
        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_CALLBACK_URL
        );
        auth.setCredentials({ access_token: user.accessToken, refresh_token: user.refreshToken });
        auth.on('tokens', async (tokens) => {
            if (tokens.access_token) {
                user.accessToken = tokens.access_token;
                if (tokens.refresh_token) user.refreshToken = tokens.refresh_token;
                await user.save();
            }
        });

        const formsApi = google.forms({ version: 'v1', auth });

        // 4. Get current form to know how many items exist (for correct index)
        const currentForm = await formsApi.forms.get({ formId: form.formId });
        const currentItemCount = (currentForm.data.items || []).length;

        // 5. Build batchUpdate requests — append after existing items
        const requests = questions.map((q, i) => ({
            createItem: {
                item: {
                    title: q.title || 'Untitled Question',
                    questionItem: {
                        question: {
                            required: true,
                            ...buildQuestion(q.type, q.options || [])
                        }
                    }
                },
                location: { index: currentItemCount + i }
            }
        }));

        await formsApi.forms.batchUpdate({
            formId: form.formId,
            requestBody: { requests }
        });

        console.log(`Expanded form ${form.formId} with ${questions.length} new questions`);
        res.json({ message: 'Form expanded successfully', questionsAdded: questions.length, questions });

    } catch (error) {
        console.error('Expand Form Error:', error.message);
        if (error.message?.includes('invalid_grant') || error.code === 401) {
            return res.status(401).json({ message: 'Google session expired. Please log in again.', error: 'AUTH_EXPIRED' });
        }
        res.status(500).json({ message: 'Failed to expand form', error: error.message });
    }
};

const duplicateForm = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    try {
        const original = await Form.findById(id);
        if (!original) return res.status(404).json({ message: 'Form not found' });

        const user = await User.findById(userId);
        if (!user || !user.accessToken) return res.status(401).json({ message: 'No Google access token.' });

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_CALLBACK_URL
        );
        auth.setCredentials({ access_token: user.accessToken, refresh_token: user.refreshToken });
        auth.on('tokens', async (tokens) => {
            if (tokens.access_token) { user.accessToken = tokens.access_token; await user.save(); }
        });

        const formsApi = google.forms({ version: 'v1', auth });

        // 1. Fetch original Google Form questions
        const originalForm = await formsApi.forms.get({ formId: original.formId });
        const items = originalForm.data.items || [];

        // 2. Create new blank form
        const newTitle = `Copy of ${original.title}`;
        const createRes = await formsApi.forms.create({
            requestBody: { info: { title: newTitle } }
        });
        const newFormId = createRes.data.formId;

        // 3. Clone all questions via batchUpdate
        if (items.length > 0) {
            const requests = items.map((item, i) => {
                const req = { createItem: { item: { title: item.title || '' }, location: { index: i } } };
                if (item.questionItem) req.createItem.item.questionItem = item.questionItem;
                if (item.textItem) req.createItem.item.textItem = item.textItem;
                if (item.imageItem) req.createItem.item.imageItem = item.imageItem;
                return req;
            });
            await formsApi.forms.batchUpdate({ formId: newFormId, requestBody: { requests } });
        }

        // 4. Save to MongoDB
        const newForm = new Form({
            userId: user._id,
            formId: newFormId,
            title: newTitle,
            publicUrl: createRes.data.responderUri,
            editUrl: `https://docs.google.com/forms/d/${newFormId}/edit`,
            expiryDate: original.expiryDate,
        });
        await newForm.save();

        res.json(newForm);
    } catch (error) {
        console.error('Duplicate Form Error:', error.message);
        res.status(500).json({ message: 'Failed to duplicate form', error: error.message });
    }
};

const bulkDeleteForms = async (req, res) => {
    const { ids } = req.body;  // array of MongoDB _ids
    if (!ids || !Array.isArray(ids) || ids.length === 0)
        return res.status(400).json({ message: 'ids array is required' });
    try {
        const result = await Form.deleteMany({ _id: { $in: ids } });
        res.json({ message: `Deleted ${result.deletedCount} form(s)` });
    } catch (error) {
        res.status(500).json({ message: 'Bulk delete failed', error: error.message });
    }
};

module.exports = {
    createGoogleForm,
    getUserForms,
    deleteForm,
    expandForm,
    duplicateForm,
    bulkDeleteForms
};
