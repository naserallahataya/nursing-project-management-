const mongoose = require('mongoose');
const { Types } = mongoose;
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false,
        unique: true
    },
    phone: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    birthDate: {
        type: Date,
        required: false
    },
    studentYear: {
        type: String,
        required: true,
        enum: ['1st year', '2nd year', '3rd year', '4th year']
    },
    status: {
        type: String,
        required: false,
        enum: ['student', 'graduated']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    address: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    hospital: {
        type:Types.ObjectId,
        ref: 'Hospital',
        required: false
    },
    room:{
        type:Types.ObjectId,
        ref: 'Room',
        required: false
    },
    building:{
        type:Types.ObjectId,
        ref: 'Build',
        required: false
    },
    floor:{
        type:Types.ObjectId,
        ref: 'Floor',
        required: false
    },
    specialization: {
        type: String,
        required: false,
        enum: [
            'Adult Nursing',
            'Critical Care Nursing',
            'Maternal and Child Health Nursing',
            'Psychiatric and Mental Health Nursing',
            'Community Health Nursing',
            'Nursing Administration',
            'General'
        ]
    },
});
module.exports = mongoose.model('User', userSchema);
