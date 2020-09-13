//middlewares
const auth = require('./../middleware/auth');
const admin = require('../middleware/roles/admin');
const userIsActive = require('./../middleware/userIsActive');

//enums

//models
const { Customer } = require('./../models/customer');
const { Section } = require('./../models/section');
const { Discount, validateDiscount } = require('./../models/discount');

//custom packages
const sendVerificationEmail = require('./../helpers/mailer/mailer');
const responseWithPagination = require('./../helpers/pagination/responseWithPagination');
const paramsValidationOfPagination = require('./../helpers/pagination/paramsValidation');
const escapeRegex = require('./../helpers/pagination/escapeRegex');
const asyncForEach = require('./../helpers/asyncForEach/asyncForEach');

//packages
const _ = require('lodash');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

//insert discount
router.post('/', [auth, userIsActive, admin], async (req, res) => {
    //check if the request is valide
    const { error } = validateDiscount(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //check if te customer exists
    const customer = await Customer.findById(req.body.customer);
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    //check if the section exists
    const section = await Section.findById(req.body.section);
    if (!section) return res.status(404).send('The section with the given ID was not found.');

    //check if the sub section exists
    const subSection = await section.subSection.id(req.body.subSection)
    if (!subSection) return res.status(404).send('The sub Section with the given ID was not found.');

    let discount = new Discount(_.pick(req.body, ['customer', 'section', 'subSection', 'start', 'end', 'value', 'typeValue']));
    discount.admin = req.user.reference;

    res.status(201).send(await discount.save());
});

//desactive discount
router.delete('/:id', [auth, userIsActive, admin], async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid discount id.');

    const discount = await Discount.findOne({ _id: req.params.id, admin: req.user.reference });
    if (!discount) return res.status(404).send('The discount with the given ID was not found.');
    discount.isActive = false;
    res.send(await discount.save());
});

//detail discount
router.get('/:id', [auth, userIsActive, admin], async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid discount id.');

    const discount = await Discount.findOne({ _id: req.params.id, admin: req.user.reference });
    if (!discount) return res.status(404).send('The discount with the given ID was not found.');

    res.send(discount);
});


//update discount
router.put('/:id', [auth, userIsActive, admin], async (req, res) => {
    //check if the request is valide
    const { error } = validateDiscount(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid discount id.');

    const discount = await Discount.findOne({ _id: req.params.id, admin: req.user.reference });
    if (!discount) return res.status(404).send('The discount with the given ID was not found.');

    discount.set(_.pick(req.body, ['customer', 'section', 'subSection', 'start', 'end', 'value', 'typeValue']));

    res.status(201).send(await discount.save());

});

//list discount
router.post('/list', [auth, userIsActive, admin], async (req, res) => {
    const { error } = paramsValidationOfPagination(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    var name = req.body.SortingParameters.SortDirection == 'desc' ? 1 : -1;
    const SearchQuery = escapeRegex(req.body.SearchQuery);

    const discount = await Discount.find({ admin: req.user.reference });
        // .or([{ name: SearchQuery, phoneNumber: SearchQuery }])
        // .sort({ name })
        // .select({ name: 1, phoneNumber: 1 });

    res.send(await responseWithPagination(discount, req.body.paginationParameters.PageSize, req.body.paginationParameters.PageNumber));
});


module.exports = router;