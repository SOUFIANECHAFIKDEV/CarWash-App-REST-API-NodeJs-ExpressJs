const Joi = require('joi');
const mongoose = require('mongoose');

const permissionsSchema = new mongoose.Schema({
    section: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    subSection: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

const employeeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    permissions: [permissionsSchema]
});

function validateEmployee(employee) {
    const schema = {
        permissions: Joi.array()
    };

    return Joi.validate(employee, schema);
}

const Employee = mongoose.model('Employee', employeeSchema);

module.exports.validateEmployee = validateEmployee;
module.exports.Employee = Employee;