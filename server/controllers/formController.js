const { google } = require('googleapis');
const User = require('../models/User');
const Form = require('../models/Form');

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
        const newForm = new Form({
            userId: user._id,
            formId: formId,
            title: title || 'AI Generated Form',
            publicUrl: createRes.data.responderUri,
            editUrl: `https://docs.google.com/forms/d/${formId}/edit`,
            expiryDate: config?.expiryDate ? new Date(config.expiryDate) : null,
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
        res.json(forms);
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

module.exports = {
    createGoogleForm,
    getUserForms,
    deleteForm
};
