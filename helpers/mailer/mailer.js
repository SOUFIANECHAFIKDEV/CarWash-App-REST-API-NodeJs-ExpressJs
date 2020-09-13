const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

module.exports = function (userEmail, userName, token) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 25,
        secure: false,
        auth: {
            user: 'codectereo@gmail.com',
            pass: 'soufianeAAA1995'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const output = `
    <p>Hi ${userName}</p>
    <h3>Please verify your email address so we know that it's really you!</h3>
    <a href="http://localhost:3000/api/admins/emailConfirmation/${token}">Verify my email address</a>
    `;

    let mailOptions = {
        from: '"car wash App" <codectereo@gmail.com>',
        to: userEmail,
        subject: 'Please verify your email address',
        text: 'Please verify your email address',
        html: output
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });

};