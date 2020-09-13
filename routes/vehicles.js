//middlewares
const auth = require('./../middleware/auth');
const admin = require('../middleware/roles/admin');
const userIsActive = require('./../middleware/userIsActive');
//models
const { Admin } = require('./../models/admin');
const { Customer } = require('./../models/customer');
//packages
const Joi = require('joi');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();


//create new Vehicle
router.post('/', [auth, userIsActive, admin], async (req, res) => {
    const { error } = validateVehicle(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // const admin = await Admin.findOne({ userId: req.user._id });
    const customer = await Customer.findOne({ _id: req.body.idCustomer, adminId: req.user.reference });
    if (!customer) return res.status(404).send('The vehicle with the given ID was not found.');

    customer.Vehicles.push({
        TypeOfCar: req.body.TypeOfCar,
        Model: req.body.Model,
        LicensePlateNumber: req.body.LicensePlateNumber,
    });
    // if (!vehicle) return res.status(404).send('The vehicle with the given ID was not found.');

    const result = await customer.save();
    res.send(result.Vehicles[result.Vehicles.length - 1]);
});

// update vehicle
router.put('/:idVehicle', [auth, userIsActive, admin], async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.idVehicle)) return 'Invalid Vehicle id.';

    const { error } = validateVehicle(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findOne({ _id: req.body.idCustomer, adminId: req.user.reference });
    if (!customer) return res.status(404).send('The vehicle with the given ID was not found.');

    //check if the vehicle exists
    const vehicle = await customer.Vehicles.id(req.params.idVehicle);
    if (!vehicle) return res.status(404).send('The vehicle with the given ID was not found.');

    vehicle.TypeOfCar = req.body.TypeOfCar;
    vehicle.Model = req.body.Model;
    vehicle.LicensePlateNumber = req.body.LicensePlateNumber;

    customer.save();
    res.send(vehicle);
});

// delete vehicle
router.delete('/:idVehicle', [auth, userIsActive, admin], async (req, res) => {
    //check if the id customer & id vehicle is valid
    if (!mongoose.Types.ObjectId.isValid(req.body.idCustomer)) return 'Invalid customer id .';
    if (!mongoose.Types.ObjectId.isValid(req.params.idVehicle)) return 'Invalid Vehicle id.';

    const customer = await Customer.findOne({ _id: req.body.idCustomer, adminId: req.user.reference });
    if (!customer) return res.status(404).send('The vehicle with the given ID was not found.');

    const vehicle = await customer.Vehicles.id(req.params.idVehicle);
    vehicle.remove();
    const result = await customer.save();
    res.send(true);
});

// detail vehicle
router.get('/', [auth, userIsActive], async (req, res) => {
    //check if the id customer & id vehicle is valid
    if (!mongoose.Types.ObjectId.isValid(req.query.idCustomer)) return 'Invalid customer id .';
    if (!mongoose.Types.ObjectId.isValid(req.query.idVehicle)) return 'Invalid Vehicle id.';

    const customer = await Customer.findOne({ _id: req.query.idCustomer, adminId: req.user.reference });
    if (!customer) return res.status(404).send('The vehicle with the given ID was not found.');

    const vehicle = await customer.Vehicles.id(req.query.idVehicle);
    res.send(vehicle);
});

function validateVehicle(user) {
    const schema = {
        TypeOfCar: Joi.string().min(1).max(50).required(),
        Model: Joi.string().max(50).required(),
        LicensePlateNumber: Joi.string().max(50).required(),
        idCustomer: Joi.objectId(),
        // idVehicle: Joi.objectId()
    };

    return Joi.validate(user, schema);
}

module.exports = router;