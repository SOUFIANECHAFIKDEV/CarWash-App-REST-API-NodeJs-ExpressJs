const Joi = require('joi');
const mongoose = require('mongoose');
const subscribeTypes = require('./../models/subscribeTypes');

const subscribeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    end: {
        type: Date,
        required: true,
    },
    subscribe: {
        type: subscribeTypes.subscribeTypesSchema
    }
});

const Subscribe = mongoose.model('Subscribe', subscribeSchema);

function validateSubscribe() {
    const schema = {
        user: Joi.objectId().required(),
        end: Joi.Date().require(),
        subscribe: {
            name: Joi.string().required(),
            reference: Joi.number().required(),
            bcryptRef: Joi.string().required(),
            numberDates: Joi.number().required(),
        }
    };

    return Joi.validate(Subscribe, schema);
}

exports.Subscribe = Subscribe;
exports.validate = validateSubscribe;