//middlewares
const auth = require('./../middleware/auth');
const admin = require('../middleware/roles/admin');
const userIsActive = require('./../middleware/userIsActive');
//enums
const userTypeEnum = require('../Enums/userTypeEnum');
//models
const { Employee, validateEmployee } = require('./../models/employee');
const { Section, validateSection } = require('./../models/section');
const { User, validateRequestForUserCollection } = require('../models/user');
//custom packages
const sendVerificationEmail = require('./../helpers/mailer/mailer');
const responseWithPagination = require('./../helpers/pagination/responseWithPagination');
const paramsValidationOfPagination = require('./../helpers/pagination/paramsValidation');
const escapeRegex = require('./../helpers/pagination/escapeRegex');
const asyncForEach = require('./../helpers/asyncForEach/asyncForEach');
//packages
const Joi = require('joi');
const Fawn = require('fawn');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

//create
router.post('/', [auth, userIsActive, admin], async (req, res) => {
    const { error } = validateRequestForUserCollection(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body, ['email', 'password', 'name', 'country', 'phoneNumber', 'defaultLanguage']));
    user.userType = userTypeEnum.Employee.reference;
    user.reference = req.user.reference;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const employee = new Employee({
        userId: user._id,
        admin: req.user.reference,
        permissions: []
    });
    try {
        new Fawn.Task()
            .save('users', user)
            .save('employees', employee)
            .run();

        const token = await user.generateAuthToken();
        sendVerificationEmail(user.email, user.name, token);

        res.status(201).send({ user, employee });
    }
    catch (ex) {
        res.status(500).send('Something failed.');
    }
});

//update
router.put('/:id', [auth, userIsActive, admin], async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid employee id.');

    const { error } = validate_for_update(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const employee = await Employee.findOne({ _id: req.params.id, admin: req.user.reference });
    if (!employee) return res.status(404).send('The employee with the given ID was not found.');

    const user = await User.findById(employee.userId);

    user.name = req.body.name;
    user.country = req.body.country;
    user.phoneNumber = req.body.phoneNumber;
    user.defaultLanguage = req.body.defaultLanguage;

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    res.send(await user.save());
});

//delete
router.delete('/:id', [auth, userIsActive, admin], async (req, res) => {
    //check if the id is valid object
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid employee id.');

    const employee = await Employee.findOne({ _id: req.params.id, admin: req.user.reference });
    if (!employee) return res.status(404).send('The employee with the given ID was not found.');

    const user = await User.findById(employee.userId);

    try {
        new Fawn.Task()
            .remove('users', { _id: employee.userId })
            .remove('employees', { _id: employee._id })
            .run();

        res.send(true);
    }
    catch (ex) {
        throw ex;
        res.status(500).send('Something failed.');
    }
});

//list
router.post('/list', [auth, userIsActive, admin], async (req, res) => {
    const { error } = paramsValidationOfPagination(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const name = req.body.SortingParameters.SortDirection == 'desc' ? 1 : -1;
    const SearchQuery = escapeRegex(req.body.SearchQuery);

    const employeesList = await Employee.find({ admin: req.user.reference });

    let list = [];

    await asyncForEach(employeesList, async (item) => {
        const user = await User
            .findById(item.userId)
            .or([{ name: SearchQuery }])
            .sort({ name })
            .select('-password');

        list.push(user);
    });


    res.send(await responseWithPagination(list, req.body.paginationParameters.PageSize, req.body.paginationParameters.PageNumber));
});

//detail
router.get('/:id', [auth, userIsActive], async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid employee id.');

    const employee = await Employee.findOne({ admin: req.user.reference, _id: req.params.id });
    if (!employee) return res.status(404).send('The employee with the given ID was not found.');

    res.send(await User.findById(employee.userId));
});

//give permissions
router.post('/addPermission', [auth, userIsActive, admin], async (req, res) => {
    //check if the request is valide
    const { error } = validate_Request_For_Add_Permissions(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //check if te employee exists
    const employee = await Employee.findById(req.body.employee);
    if (!employee) return res.status(404).send('The employee with the given ID was not found.');

    //check if the section exists
    const section = await Section.findById(req.body.section);
    if (!section) return res.status(404).send('The section with the given ID was not found.');

    //check if the sub section exists
    const subSection = await section.subSection.id(req.body.subSection)
    if (!subSection) return res.status(404).send('The sub Section with the given ID was not found.');

    employee.permissions.push(_.pick(req.body, ['section', 'subSection']));
    const result = await employee.save();

    res.status(200).send(_.last(result.permissions));
});

// remove permissions
router.post('/removePermissions', [auth, userIsActive, admin], async (req, res) => {
    //check if the request is valide
    const { error } = validate_Request_For_Add_Permissions(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //check if te employee exists
    const employee = await Employee.findById(req.body.employee);
    if (!employee) return res.status(404).send('The employee with the given ID was not found.');

    //check if the permission exists
    const permission = await employee.permissions.id(req.body.permission);
    if (!permission) return res.status(404).send('The sub Section with the given ID was not found.');
    employee.permissions.id(req.body.permission).remove();

    const result = await employee.save();

    res.status(200).send(result);
});


module.exports = router;


function validate_for_update(user) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        password: Joi.string().min(5).max(255).required(),
        country: Joi.string().min(5).max(255).required(),
        phoneNumber: Joi.string().min(10).max(255).required(),
        defaultLanguage: Joi.string().min(2).max(10).required(),
    };

    return Joi.validate(user, schema);
}

function validate_Request_For_Add_Permissions(body) {
    const schema = {
        employee: Joi.objectId(),
        section: Joi.objectId(),
        subSection: Joi.objectId(),
        permission: Joi.objectId()
    };
    return Joi.validate(body, schema);
}