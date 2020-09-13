//middlewares
const auth = require('./../middleware/auth');
const admin = require('../middleware/roles/admin');
const userIsActive = require('./../middleware/userIsActive');
//models
const { Admin } = require('./../models/admin');
const { Customer, validate } = require('../models/customer');
//custom packages
const responseWithPagination = require('./../helpers/pagination/responseWithPagination');
const paramsValidationOfPagination = require('./../helpers/pagination/paramsValidation');
const escapeRegex = require('./../helpers/pagination/escapeRegex');
//packages
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();


//get customers list 
router.post('/list', [auth, userIsActive], async (req, res) => {
    const { error } = paramsValidationOfPagination(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // check if the admin is exists
    const admin = await Admin.findById(req.user.reference);
    if (!admin) return res.status(400).send('Invalid Admin.');

    var name = req.body.SortingParameters.SortDirection == 'desc' ? 1 : -1;
    const SearchQuery = escapeRegex(req.body.SearchQuery);

    const customers = await Customer
        .find({ adminId: admin._id })
        .or([{ name: SearchQuery, phoneNumber: SearchQuery }])
        .sort({ name })
        .select({ name: 1, phoneNumber: 1 });

    res.send(await responseWithPagination(customers, req.body.paginationParameters.PageSize, req.body.paginationParameters.PageNumber));
});


//get customer details
router.get('/:id', [auth, userIsActive], async (req, res) => {
    //check if the id is valid object
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid customer id.');

    const customer = await Customer.findOne({ _id: req.params.id, adminId: req.user.reference });

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(customer);
});


//create new customer
router.post('/', [auth, userIsActive, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // check if the admin is exists
    const admin = await Admin.findById(req.user.reference);
    if (!Admin) return res.status(400).send('Invalid Admin.');

    const client = new Customer({
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        Barcode: req.body.Barcode,
        adminId: admin._id,
        Vehicles: req.body.Vehicles
    });
    const result = await client.save();

    res.status(201).send(result);
});


//update an customer
router.put('/:id', [auth, userIsActive, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //check if the id is valid object
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid customer id.');

    //check if the customer exist
    const customer = await Customer.findOne({ _id: req.params.id, adminId: req.user.reference });
    if (!customer) return res.status(400).send('The customer with the given ID was not found.');

    const result = await Customer.update({ _id: req.params.id, adminId: req.user.reference }, {
        $set: {
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            Barcode: req.body.Barcode,
        },
        new: 1
    });
    res.send(result);
});


//delete an customer
router.delete('/:id', [auth, userIsActive, admin], async (req, res) => {
    //check if the id is valid object
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid customer id.');

    //check if the customer exist
    const customer = await Customer.findOneAndRemove({ _id: req.params.id, adminId: req.user.reference });
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(customer);
});

module.exports = router;


