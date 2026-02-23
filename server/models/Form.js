const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    formId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    publicUrl: {
        type: String,
        required: true
    },
    editUrl: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date
    },
    maxResponses: {
        type: Number
    },
    responseCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Form', FormSchema);
