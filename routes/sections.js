//middlewares
const auth = require('./../middleware/auth');
const admin = require('../middleware/roles/admin');
const userIsActive = require('./../middleware/userIsActive');
//models
const { Section, validateSection } = require('./../models/section');
//custom packages
const responseWithPagination = require('./../helpers/pagination/responseWithPagination');
const paramsValidationOfPagination = require('./../helpers/pagination/paramsValidation');
const escapeRegex = require('./../helpers/pagination/escapeRegex');
//packages
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

//create new Section
router.post('/', [auth, userIsActive, admin], async (req, res) => {
    const { error } = validateSection(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const section = new Section({
        name: req.body.name,
        adminId: req.user.reference,
        subSection: []
    });
    const result = await section.save();
    res.status(200).send(result);
});

//update Section
router.put('/:id', [auth, userIsActive, admin], async (req, res) => {
    const { error } = validateSection(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) res.status(400).send('Invalid section id');

    const section = await Section.findOne({ _id: req.params.id, adminId: req.user.reference });
    if (!section) return res.status(400).send('The section with the given ID was not found.');

    section.name = req.body.name;

    const result = await section.save();

    res.send(result);
});

//delete section
router.delete('/:id', [auth, userIsActive, admin], async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) res.status(400).send('Invalid section id');

    const section = await Section.findOneAndRemove({ _id: req.params.id, adminId: req.user.reference });
    if (!section) return res.status(400).send('The section with the given ID was not found.');

    const result = await section.save();

    res.send(result);
});

//get sections list 
router.post('/list', [auth, userIsActive], async (req, res) => {
    const { error } = paramsValidationOfPagination(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    var name = req.body.SortingParameters.SortDirection == 'desc' ? 1 : -1;
    const SearchQuery = escapeRegex(req.body.SearchQuery);

    const sections = await Section
        .find({ adminId: req.user.reference })
        .or([{ name: SearchQuery }])
        .sort({ name });

    res.send(await responseWithPagination(sections, req.body.paginationParameters.PageSize, req.body.paginationParameters.PageNumber));
});

//get section detail
router.get('/:id', [auth, userIsActive], async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) res.status(400).send('Invalid section id');

    const section = await Section.findOne({ _id: req.params.id, adminId: req.user.reference });
    if (!section) return res.status(400).send('The section with the given ID was not found.');

    res.send(section);
});

module.exports = router;