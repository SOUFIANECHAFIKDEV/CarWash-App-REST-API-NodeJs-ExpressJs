//middlewares
const auth = require('./../middleware/auth');
const admin = require('./../middleware/roles/admin');
const userIsActive = require('./../middleware/userIsActive');
//models
const { User } = require('./../models/user');
const { SubscribeType } = require('./../models/subscribeTypes');
const { Subscribe } = require('./../models/subscribe');
//configurations
const config = require('config')
//packages
const _ = require('lodash');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

router.get('/successPayment/:subscribeType/:token', async (req, res) => {
    //if id of subscribe Type is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.subscribeType)) return res.status(400).send('Invalid subscribe Type id.');

    // get the the user from the token
    const token = req.params.token;
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    //check if the user is not found
    const user = await User.findById(decoded._id);
    if (!user) return res.status(404).send('The user with the given ID was not found.');

    //get the subscribe Type informations
    const subscribeType = await SubscribeType.findById(req.params.subscribeType);
    if (!subscribeType) return res.status(404).send('The subscribeType with the given ID was not found.');


    Date.prototype.addDays = function (days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

    let date = new Date();

    const subscribe = new Subscribe({
        user: decoded._id,
        end: date.addDays(subscribeType.numberDates),
        subscribe: _.pick(subscribeType, ['name', 'reference', 'bcryptRef', 'numberDates'])
    });

    const newSubscribe = await subscribe.save();

    res.send(newSubscribe);
});

router.get('/', [auth, userIsActive, admin], async (req, res) => {
    res.send(await SubscribeType.find());
});

module.exports = router;