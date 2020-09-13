const Joi = require('joi');
const mongoose = require('mongoose');

const customerVehiclesSchema = new mongoose.Schema({
    TypeOfCar: String,
    Model: String,
    LicensePlateNumber: String
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
    },
    Barcode: {
        type: String,
        maxlength: 1024
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    Vehicles: [customerVehiclesSchema]
});


const Customer = mongoose.model('Customer', customerSchema);

function validateCustomer(customer) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        phoneNumber: Joi.string().min(10).max(255).required(),
        adminId: Joi.objectId(),
        Barcode: Joi.string(),
        Vehicles: Joi.array()
    };

    return Joi.validate(customer, schema);
}

exports.Customer = Customer;
exports.validate = validateCustomer;