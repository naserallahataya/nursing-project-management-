const mongoose = require('mongoose');
const { Types } = mongoose;

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    vacancies: {
        type: Number,
        required: true
    },
    students: [{
        type: Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('Hospital', hospitalSchema);
