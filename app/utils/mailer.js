let nodemailer = require('nodemailer');
var config = require('../../config');

let transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    auth: {
        user: config.mail.username,
        pass: config.mail.password
    }
});

module.exports = {
    sendEmailVerificationMail: function sendEmailVerificationMail(code, recipient){

        let mailOptions = {
            from: config.mail.sender,
            to: recipient,
            subject: 'Welcome!',
            text: 'Hello! Thank you for signing up on our site. Find your verification code below.' + code,
            html: 'Hello!<br><br>Thank you for signing up on our site. Find your verification code below.' +
            '<br><br>' + code
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Error: ', error.message, ' : ', new Date());
            }
        });
    },

    sendPasswordResetMail: function sendPasswordResetMail(pwdresetlink, recipient){
        
        let mailOptions = {
            from: config.mail.sender,
            to: recipient,
            subject: 'Password Reset',
            text: 'Hello! ', // plaintext body
            html: 'Hello !<br><br>We heard you need your password reset. Click the link below and you\'ll be redirected to a secure location from where you can set a new password.<br><br><a target="_blank" href="' + pwdresetlink + '">' + pwdresetlink + '</a><br><br>This link is valid for only 1 hour. <br><br>If you didn\'t try to reset your password, simply ignore this mail, and we\'ll forget this ever happened.' // html body
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error.message, ' : ', new Date());
            }
        });
    }
};