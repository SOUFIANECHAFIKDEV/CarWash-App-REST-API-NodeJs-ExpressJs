//middlewares
const auth = require('./../middleware/auth');
const employeeMiddleware = require('../middleware/roles/employee');
const adminMiddleware = require('../middleware/roles/admin');
const userIsActive = require('./../middleware/userIsActive');
//Enum
const userTypeEnum = require('../Enums/userTypeEnum');
//models
const { Customer } = require('../models/customer');
const { Billing, validateBilling } = require('./../models/billing');
const { Employee } = require('./../models/employee');
const { Section } = require('./../models/section');
//custom packages
const responseWithPagination = require('./../helpers/pagination/responseWithPagination');
const paramsValidationOfPagination = require('./../helpers/pagination/paramsValidation');
const asyncForEach = require('./../helpers/asyncForEach/asyncForEach');
//packages
const Joi = require('joi');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

//create new billing
router.post('/', [auth, userIsActive, employeeMiddleware], async (req, res) => {
    const { error } = validateBilling(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (req.body.customer.customerIsRegistered) {
        //check if the customer exist
        const customer = await Customer.findOne({ _id: req.body.customer.customer.IdCustomer, adminId: req.user.reference });
        if (!customer) return res.status(400).send('The customer with the given ID was not found.');

        //check if the Vehicle exist
        const Vehicle = await customer.Vehicles.id(req.body.customer.customer.IdVehicle);
        if (!Vehicle) return res.status(400).send('The Vehicle with the given ID was not found.');
    }

    const sectionsList = async () => {
        let sectionList = [];
        await asyncForEach(req.body.sections, async (element) => {

            //check if the section exist
            const sectionById = await Section.findOne({ _id: element.IdSection, adminId: req.user.reference });
            if (!sectionById) return res.status(400).send(`The section with the given ID = ${element.IdSection} was not found.`);

            //check if the subSection exist  
            const subSection = sectionById.subSection.id(element.idSubSection);
            if (!subSection) return res.status(400).send(`The sub Section with the given ID = ${element.idSubSection} was not found.`);

            //add the section informations
            sectionList.push({
                category: sectionById.name,
                name: subSection.name,
                price: subSection.price
            });
        });
        return sectionList;
    };

    //insert the new billing
    const billing = new Billing({
        customerIsRegistered: req.body.customer.customerIsRegistered,
        customer: req.body.customer.customerIsRegistered ? null : { name: req.body.customer.customer.name, phoneNumber: req.body.customer.customer.phoneNumber },
        vehicle: req.body.customer.customerIsRegistered ? null : req.body.customer.customer.vehicle,
        IdCustomer: !req.body.customer.customerIsRegistered ? null : req.body.customer.customer.IdCustomer,
        IdVehicle: !req.body.customer.customerIsRegistered ? null : req.body.customer.customer.IdVehicle,
        employee: req.user.employee,
        sections: await sectionsList()
    });

    //save infos in the document and retrun response 
    res.status(201).send(await billing.save());
});

//desactive billing
router.delete('/:id', [auth, userIsActive, adminMiddleware], async (req, res) => {
    //check if the id is valide objectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) res.status(400).send('Invalid billing id');

    //check if the bulling with given id is exists 
    const billing = await Billing.findById(req.params.id);
    if (!billing) res.status(400).send('The billing with the given id not found');

    //update the is active proprtie
    billing.isActive = false;

    //save in the document and return respense with status 200
    res.send(await billing.save());
});

//list
router.post('/list', [auth, userIsActive], async (req, res) => {
    // const billing = Billing.find();
    const { error } = paramsValidationOfPagination(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const billing = await Billing.find();

    // var name = req.body.SortingParameters.SortDirection == 'desc' ? 1 : -1;
    // const SearchQuery = escapeRegex(req.body.SearchQuery);

    // const customers = await Customer
    //     .find({ adminId: billing._id })
    //     .or([{ name: SearchQuery, phoneNumber: SearchQuery }])
    //     .sort({ name })
    //     .select({ name: 1, phoneNumber: 1 });

    res.send(await responseWithPagination(billing, req.body.paginationParameters.PageSize, req.body.paginationParameters.PageNumber));
});

//get by customer
///getByCustomer?id=qsdqsdqsdqsd
router.get('/getByCustomer', [auth, userIsActive], async (req, res) => {
    //check if the id is valide objectId
    if (!mongoose.Types.ObjectId.isValid(req.query.id)) return res.status(400).send('Invalid customer id');

    //check if the Customer is exists adminId
    const customer = await Customer.find({ _id: req.query.id, adminId: req.user.reference });
    if (!customer) return res.status(400).send('the customer with the given id not exists');

    const billings = await Billing.find();

    let listBillings = [];
    await asyncForEach(billings, async (billing) => {
        // check if the user Type is Employee
        if (req.user.userType == userTypeEnum.Employee.reference) {
            // check if the id of employee of the billing  equals id of employee connected
            //check if the given customer id equals billing customer id
            if (billing.employee == req.user.employee && billing.IdCustomer == req.query.id && billing.customerIsRegistered) {
                listBillings.push(billing);
            }
            // check if the user Type is Admin
        } else if (req.user.userType == userTypeEnum.Admin.reference) {
            if (billing.IdCustomer == req.query.id && billing.customerIsRegistered) {
                listBillings.push(billing);
            }
        }
    });
    res.send(listBillings);
});
//get by employee
router.get('/getByEmployee', [auth, userIsActive, adminMiddleware], async (req, res) => {
    //check if the id is valide objectId
    if (!mongoose.Types.ObjectId.isValid(req.query.id)) return res.status(400).send('Invalid employee id');

    //check if the Employee is exists adminId
    const employee = await Employee.findOne({ _id: req.query.id, admin: req.user.reference });
    if (!employee) return res.status(400).send('the employee with the given id not exists');
    // res.send(employee);
    const billings = await Billing.find();

    let listBillings = [];

    await asyncForEach(billings, async (billing) => {
        if(billing.employee == req.query.id && billing.customerIsRegistered){
            listBillings.push(billing);
        }
    });

    res.send(listBillings);
});

module.exports = router;