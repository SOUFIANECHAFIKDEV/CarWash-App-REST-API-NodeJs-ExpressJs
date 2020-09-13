const express = require('express');
const morgan = require('morgan');
const admins = require('./../routes/admins');
const auth = require('./../routes/auth');
const subscribe = require('./../routes/subscribe');
const customers = require('./../routes/customers');
const vehicles = require('./../routes/vehicles');
const sections = require('./../routes/sections');
const subSections = require('./../routes/subSections');
const employees = require('./../routes/employees');
const discounts = require('./../routes/discounts');
const billings = require('./../routes/billings');
const appSettings = require('./../routes/appSettings');
const error = require('../middleware/error');

module.exports = function (app) {
    app.use(express.json());
    app.use(morgan('tiny'));
    app.use('/api/admins', admins);
    app.use('/api/auth', auth);
    app.use('/api/subscribe', subscribe);
    app.use('/api/customers', customers);
    app.use('/api/vehicles', vehicles);
    app.use('/api/sections', sections);
    app.use('/api/subSections', subSections);
    app.use('/api/employees', employees);
    app.use('/api/discounts', discounts);
    app.use('/api/billings', billings);
    app.use('/api/appSettings', appSettings);
    app.use(error);
}