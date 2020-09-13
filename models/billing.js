const Joi = require('joi');
const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    category: String,
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    price: {
        type: Number,
        required: true,
    }
});

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    phoneNumber: {
        type: String,
        required: false,
        minlength: 10,
        maxlength: 255
    }
});

const vehicleSchema = new mongoose.Schema({
    TypeOfCar: String,
    Model: String,
    LicensePlateNumber: String
});

//mongoose.Schema.Types.ObjectId
const BillingsSchema = new mongoose.Schema({
    customerIsRegistered: {
        type: Boolean,
        required: true
    },
    customer: {
        type: customerSchema,
        required: function () { return !this.customerIsRegistered },
    },
    vehicle: {
        type: vehicleSchema,
        required: function () { return !this.customerIsRegistered }
    },
    IdCustomer: {
        type: mongoose.Schema.Types.ObjectId,
        required: function () { return this.customerIsRegistered }
    },
    IdVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        required: function () { return this.customerIsRegistered }
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId
    },
    sections: [sectionSchema],
    isActive: {
        type: Boolean,
        default: true
    }
});

const Billing = mongoose.model('Billing', BillingsSchema);

//create function to validate the request 
function validateBilling(billing) {
    let body = {
        customer: {
            customerIsRegistered: billing.customer.customerIsRegistered
        }
    };

    let schema = {
        customer: Joi.object().keys({
            customerIsRegistered: Joi.boolean().required()
        })
    }

    const { error } = Joi.validate(body, schema);
    if (error) return Joi.validate(body, schema);

    if (billing.customer.customerIsRegistered) {
        schema = {
            customer: Joi.object().keys({
                customerIsRegistered: Joi.boolean().required(),
                customer: Joi.object().keys({
                    IdCustomer: Joi.objectId().required(),
                    IdVehicle: Joi.objectId().required()
                }).required()
            }).required(),

            sections: Joi.array().min(1).items(
                Joi.object().keys({
                    IdSection: Joi.objectId().required(),
                    idSubSection: Joi.objectId().required()
                })
            )
        };

        return Joi.validate(billing, schema);

    } else {
        schema = {
            customer: Joi.object().keys({
                customerIsRegistered: Joi.boolean().required(),
                customer: Joi.object().keys({
                    name: Joi.string().min(5).max(50).required(),
                    phoneNumber: Joi.string().min(10).max(255).required(),
                    vehicle: Joi.object().keys({
                        TypeOfCar: Joi.string().min(5).max(50).required(),
                        Model: Joi.string().min(5).max(50).required(),
                        LicensePlateNumber: Joi.string().min(5).max(50).required()
                    })
                }).required()
            }).required(),

            sections: Joi.array().min(1).items(
                Joi.object().keys({
                    IdSection: Joi.objectId().required(),
                    idSubSection: Joi.objectId().required()
                })
            )
        };
        return Joi.validate(billing, schema);
    }
}

exports.Billing = Billing;
exports.validateBilling = validateBilling;