//models
const { User } = require('../models/user');
const { Subscribe } = require('./../models/subscribe');
//custom packages
const asyncForEach = require('./../helpers/asyncForEach/asyncForEach');
//enums
const TestPeriodEnum = require('./../Enums/TestPeriodEnum');
const userTypeEnum = require('../Enums/userTypeEnum');
//packages
const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password.');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password.');

    const token = await user.generateAuthToken();

    if (user.userType == userTypeEnum.Admin.reference) {

        let TestPeriodIsFinished = checkTestPeriod(new Date(), user._id.getTimestamp());

        const subscribeFinish = await checkIfSubscribeIsFinish(user._id)
        const result = { token, TestPeriodIsFinished, user, subscribeFinish };
        res.send(result);

    } else if (user.userType == userTypeEnum.Employee.reference) {
        if (!user.emailIsActive) return res.status(400).send('email address not confirmed.');
        res.send({ token, user });
    }
});

function checkTestPeriod(currentDate, Timestamp) {
    var timeDiff = Math.abs(currentDate.getTime() - Timestamp.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return {
        isFinish: diffDays > TestPeriodEnum.numberDaysOfTestPeriod ? true : false,
        DateToFinish: TestPeriodEnum.numberDaysOfTestPeriod - diffDays
    }
}

function checkIfSubscribeIsFinish(user) {
    return new Promise(async (resolve, reject) => {
        try {
            let nbDates = 0;
            let currentDate = new Date();
            const subscribesList = await Subscribe.find({ user });

            const start = async () => {
                await asyncForEach(subscribesList, async (item) => {
                    let start = item._id.getTimestamp();
                    var timeDiff = Math.abs(currentDate.getTime() - start.getTime());
                    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    let total = (diffDays < item.subscribe.numberDates ? item.subscribe.numberDates - diffDays : 0);
                    nbDates = nbDates + total;
                    return total
                })
                resolve(nbDates);
            }

            start()
        } catch (ex) {
            reject(ex);
        }
    });
}

function validate(req) {
    const schema = {
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    };

    return Joi.validate(req, schema);
}

module.exports = router; 