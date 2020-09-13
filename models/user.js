const { Employee } = require('./../models/employee');
const userTypeEnum = require('../Enums/userTypeEnum');

const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    emailIsActive: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    country: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    phoneNumber: {
        type: String,
        required: false,
        minlength: 10,
        maxlength: 255
    },
    defaultLanguage: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 10
    },
    isActive: {
        type: Boolean,
        default: true
    },
    userType: {
        type: Number,
        enum: [1, 2]
    },
    reference: {
        type: mongoose.Schema.Types.ObjectId
    }
});

userSchema.methods.generateAuthToken = async function () {
    if (this.userType == userTypeEnum.Admin.reference) {
        return jwt.sign({ _id: this._id, userType: this.userType, reference: this.reference, isActive: this.isActive }, config.get('jwtPrivateKey'));

    } else if (this.userType == userTypeEnum.Employee.reference) {
        const employee = await Employee.findOne({ userId: this._id });
        if (!employee) return res.status(500).send(`The user of the employee with the given ID was not found.`);

        return jwt.sign({ employee: employee._id, _id: this._id, userType: this.userType, reference: this.reference, isActive: this.isActive }, config.get('jwtPrivateKey'));
    }
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
        country: Joi.string().min(5).max(255).required(),
        phoneNumber: Joi.string().min(10).max(255).required(),
        defaultLanguage: Joi.string().min(2).max(10).required(),
    };

    return Joi.validate(user, schema);
}

exports.User = User;
exports.validateRequestForUserCollection = validateUser;