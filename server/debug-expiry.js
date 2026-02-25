const mongoose = require('mongoose');
require('dotenv').config();
const Form = require('./models/Form');

async function checkForms() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const forms = await Form.find({});
        console.log('--- Current Forms ---');
        forms.forEach(f => {
            console.log(`Title: ${f.title}`);
            console.log(`  Expiry: ${f.expiryDate}`);
            console.log(`  Now:    ${new Date()}`);
            console.log(`  Is Expired (Logic): ${f.expiryDate && new Date(f.expiryDate) < new Date()}`);
            console.log('--------------------');
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkForms();
