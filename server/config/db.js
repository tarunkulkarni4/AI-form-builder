const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI is not defined in .env');

        const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
        console.log('Attempting to connect with:', maskedUri);

        // Fix for SRV record resolution issues on some networks
        const dns = require('dns');
        dns.setServers(['1.1.1.1', '8.8.8.8']);

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Wait only 5s instead of 30s
            connectTimeoutMS: 10000,
        });
        console.log('MongoDB Connected successfully ✅');
    } catch (err) {
        console.error('MongoDB Connection Error ❌:', err.message);
        if (err.message.includes('IP that isn\'t whitelisted')) {
            console.log('---> PLEASE CHECK: Atlas -> Network Access -> Add Current IP');
        }
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
