const Joi = require('joi');
const mongoose = require('mongoose');

// const sectionSchema = new mongoose.Schema({
//     section: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Section',
//         required: true
//     },
//     subSection: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true
//     }
// });

const discountsSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    },
    subSection: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    start: {
        type: Date,
        default: Date.now()
    },
    end: {
        type: Date,
        default: Date.now()
    },
    isActive: {
        type: Boolean,
        default: true
    },
    value: Number,
    typeValue: {
        type: Number,
        enum: [1, 2]
    }
});

const Discount = mongoose.model('Discount', discountsSchema);

function validateDiscount(Discount) {
    const schema = {
        customer: Joi.objectId(),
        section: Joi.objectId(),
        subSection: Joi.objectId(),
        admin: Joi.objectId(),
        start: Joi.date().required(),
        end: Joi.date().required(),
        isActive: Joi.boolean(),
        value: Joi.number().required(),
        typeValue: Joi.number().required(),
    };

    return Joi.validate(Discount, schema);
}

exports.Discount = Discount;
exports.validateDiscount = validateDiscount;