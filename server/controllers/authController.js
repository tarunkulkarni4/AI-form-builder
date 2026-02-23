const { google } = require('googleapis');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
);

const googleAuth = (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/forms.body',
            'https://www.googleapis.com/auth/forms.responses.readonly',
            'https://www.googleapis.com/auth/drive.file'
        ],
        prompt: 'consent'
    });
    res.redirect(url);
};

const googleCallback = async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        let user = await User.findOne({ googleId: data.id });

        if (!user) {
            user = new User({
                googleId: data.id,
                name: data.name,
                email: data.email,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token
            });
        } else {
            user.accessToken = tokens.access_token;
            if (tokens.refresh_token) user.refreshToken = tokens.refresh_token;
        }

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    } catch (error) {
        console.error('Auth Error:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
};

const getProfile = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-accessToken -refreshToken');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};

module.exports = {
    googleAuth,
    googleCallback,
    getProfile,
    logout
};
