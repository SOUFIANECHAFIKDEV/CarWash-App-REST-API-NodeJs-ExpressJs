//models
const { User, validateRequestForUserCollection } = require('../models/user');
const { Admin } = require('../models/admin');
//enums
const userTypeEnum = require('../Enums/userTypeEnum');
//configurations
const config = require('config');
//custom packages
const sendVerificationEmail = require('./../helpers/mailer/mailer');
//packages
const Fawn = require('fawn');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

Fawn.init(mongoose);

router.post('/', async (req, res) => {
    const { error } = validateRequestForUserCollection(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');

    let admin = new Admin({
        company: req.body.company
    });

    user = new User(_.pick(req.body, ['email', 'password', 'name', 'country', 'phoneNumber', 'defaultLanguage']));
    user.userType = userTypeEnum.Admin.reference;
    user.reference = admin._id
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    try {
        new Fawn.Task()
            .save('users', user)
            .save('admins', admin)
            .run();

        const token = await user.generateAuthToken();
        sendVerificationEmail(user.email, user.name, token);
        res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
    }
    catch (ex) {
        res.status(500).send('Something failed.');
    }

});

router.get('/emailConfirmation/:token', async (req, res) => {
    try {
    // get the the user from the token
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    //make sure if the user is already exists
    const user = await User.findById(decoded._id);
    if (!user) return res.status(404).send('The user with the given ID was not found.');

    //update the email is active
    user.emailIsActive = true;
    await user.save();
    
    res.send(true);
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
});

module.exports = router;