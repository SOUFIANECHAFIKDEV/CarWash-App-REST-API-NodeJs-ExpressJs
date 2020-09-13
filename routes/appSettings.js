const _ = require('lodash');
const auth = require('./../middleware/auth');
const employeeMiddleware = require('../middleware/roles/employee');
const adminMiddleware = require('../middleware/roles/admin');
const userIsActive = require('./../middleware/userIsActive');
const { AppSetting, validate } = require('./../models/appSetting');
const express = require('express');
const router = express.Router();

router.post('/', [auth, userIsActive, adminMiddleware], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const appSetting = new AppSetting({
        "label": req.body.label,
        "value": req.body.value,
        "admin": req.user.reference
    });
    const result = await appSetting.save()
    res.send(result);
});

//get settings
router.get('/', [auth, userIsActive], async (req, res) => {

    const appSetting = await AppSetting.findOne({ admin: req.user.reference });
    res.send(appSetting);
});
module.exports = router;