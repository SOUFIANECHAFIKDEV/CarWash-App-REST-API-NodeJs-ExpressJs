const Joi = require('joi');
const mongoose = require('mongoose');

const appSettingSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
});

const AppSetting = mongoose.model('AppSetting', appSettingSchema);

function validateAppSetting(AppSetting) {
    const schema = {
        label: Joi.string().min(5).max(50).required(),
        value: Joi.string().min(5).max(50).required()
    };

    return Joi.validate(AppSetting, schema);
}

exports.AppSetting = AppSetting;
exports.validate = validateAppSetting;