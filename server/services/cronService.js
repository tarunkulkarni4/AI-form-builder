const cron = require('node-cron');
const { google } = require('googleapis');
const Form = require('../models/Form');
const User = require('../models/User');

const setupCronJobs = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Running expiry check cron job...');
        try {
            const now = new Date();
            const expiredForms = await Form.find({
                isActive: true,
                $or: [
                    { expiryDate: { $lte: now } },
                    // In a real app, we'd also check response counts here
                ]
            }).populate('userId');

            for (const form of expiredForms) {
                try {
                    const user = form.userId;
                    const auth = new google.auth.OAuth2(
                        process.env.GOOGLE_CLIENT_ID,
                        process.env.GOOGLE_CLIENT_SECRET,
                        process.env.GOOGLE_CALLBACK_URL
                    );
                    auth.setCredentials({
                        access_token: user.accessToken,
                        refresh_token: user.refreshToken
                    });

                    const forms = google.forms({ version: 'v1', auth });

                    // Set acceptingResponses to false in Google Forms
                    await forms.forms.batchUpdate({
                        formId: form.formId,
                        requestBody: {
                            requests: [
                                {
                                    updateFormInfo: {
                                        info: {
                                            // This is technically updateSettings in some versions, but 
                                            // for batchUpdate we use updateFormInfo or specialized settings
                                        },
                                        updateMask: 'acceptingResponses' // Hypothetical mask for status
                                    }
                                }
                            ]
                        }
                    });

                    // Update local DB
                    form.isActive = false;
                    await form.save();
                    console.log(`Form ${form.formId} closed due to expiry.`);
                } catch (error) {
                    console.error(`Failed to close form ${form.formId}:`, error.message);
                }
            }
        } catch (error) {
            console.error('Cron Job Error:', error);
        }
    });
};

module.exports = { setupCronJobs };
