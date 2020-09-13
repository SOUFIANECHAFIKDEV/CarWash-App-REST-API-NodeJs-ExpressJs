const Joi = require('joi');
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true
    }
});

const Admin = mongoose.model('Admin', adminSchema);

function validateAdmin(admin) {
    const schema = {
        company: Joi.string().min(5).max(50).required(),
    };

    return Joi.validate(admin, schema);
}

exports.Admin = Admin;
exports.validateRequestForAdminCollection = validateAdmin;