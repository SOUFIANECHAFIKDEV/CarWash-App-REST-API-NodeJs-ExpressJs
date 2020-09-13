const Joi = require('joi');
const mongoose = require('mongoose');

const subSectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    price: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    }
});

const sectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    isActive: {
        type: Boolean,
        default: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    subSection: [subSectionSchema]
});

const Section = mongoose.model('Section', sectionSchema);

function validateSection(section) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        subSection: Joi.array()
    };

    return Joi.validate(section, schema);
}

function validateSubSection(section) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        price: Joi.number().required(),
        idSection: Joi.objectId().required(),
    };

    return Joi.validate(section, schema);
}

exports.Section = Section;
exports.validateSection = validateSection;
exports.validateSubSection = validateSubSection;