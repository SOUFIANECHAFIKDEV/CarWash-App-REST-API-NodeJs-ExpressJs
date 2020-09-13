//middlewares
const auth = require('./../middleware/auth');
const admin = require('../middleware/roles/admin');
const userIsActive = require('./../middleware/userIsActive');
//models
const { Section, validateSubSection } = require('./../models/section');
//packages
const _ = require('lodash');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

//create new sub subSection
router.post('/', [auth, userIsActive, admin], async (req, res) => {
    const { error } = validateSubSection(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const section = await Section.findOne({ _id: req.body.idSection, adminId: req.user.reference });
    if (!section) return res.status(404).send('The section with the given ID was not found.');

    section.subSection.push(_.pick(req.body, ['name', 'price']));

    const result = await section.save();
    res.status(200).send(_.last(result.subSection));
});

//delete sub subSection
router.delete('/:idsubSection', [auth, userIsActive, admin], async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.body.idsection)) res.status(400).send('Invalid section id');
    if (!mongoose.Types.ObjectId.isValid(req.params.idsubSection)) res.status(400).send('Invalid sub Section id');

    const section = await Section.findOne({ _id: req.body.idsection, adminId: req.user.reference });
    if (!section) return res.status(404).send('The section with the given ID was not found.');

    const subSection = section.subSection.id(req.params.idsubSection);
    if (!subSection) return res.status(404).send('The sub Section with the given ID was not found.');

    subSection.remove();
    section.save();

    res.send(section);
});

//get sub Section detail
router.get('/', [auth, userIsActive], async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.query.idsection)) res.status(400).send('Invalid section id');
    if (!mongoose.Types.ObjectId.isValid(req.query.idsubSection)) res.status(400).send('Invalid subSectio id');

    const section = await Section.findOne({ _id: req.query.idsection, adminId: req.user.reference });
    if (!section) return res.status(404).send('The section with the given ID was not found.');

    const subSection = section.subSection.id(req.query.idsubSection);
    if (!subSection) return res.status(404).send('The sub Section with the given ID was not found.');

    res.send(subSection);
});

//update sub subSection
router.put('/:idsubSection', [auth, userIsActive, admin], async (req, res) => {
    const { error } = validateSubSection(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (!mongoose.Types.ObjectId.isValid(req.params.idsubSection)) res.status(400).send('Invalid section id');

    const section = await Section.findOne({ _id: req.body.idSection, adminId: req.user.reference });
    if (!section) return res.status(404).send('The section with the given ID was not found.');

    const subSection = section.subSection.id(req.params.idsubSection);
    if (!subSection) return res.status(404).send('The sub Section with the given ID was not found.');

    subSection.name = req.body.name;
    subSection.price = req.body.price;

    await section.save();

    res.send(subSection);
});


module.exports = router;