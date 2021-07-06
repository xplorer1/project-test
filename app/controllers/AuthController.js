let UserModel = require('../models/UserModel');

let config = require('../../config');
let appstorage = require("../utils/nodepersist");
let mailer = require('../utils/mailer');
let jwt = require('jsonwebtoken');
let secret = config.secret;
let uuid = require('node-uuid');
let bcrypt = require('bcrypt');

module.exports = {
    /**
     * 
     * @param {email,password} req object
     * @param {object} res object
     * @returns {object} success or error response object.
    */

    signIn: async function(req, res) {
        if(!req.body.email || !req.body.password) return res.status(400).json({status: 400, message: "Email and password required."});

        try {
            let user = await UserModel.findOne({email: req.body.email.trim().toLowerCase()}).exec();

            let match = await bcrypt.compare(req.body.password.trim(), user.password.trim());
            if(!match || !user) return res.status(404).json({status: 404, message: 'Email or password incorrect.'});
            
            if(!user.verified) {
                var verification_code = uuid.v4().split('').splice(0, 5).join('').toUpperCase();

                user.verification_code = verification_code;

                await user.save();

                mailer.sendEmailVerificationMail(verification_code, req.body.email);

                return res.status(400).json({status: 400, message: "Your email is yet to be verified. Check your mail for an email activation code."});
            } else {

                var token = jwt.sign({email: user.email}, secret, {expiresIn: 86400000});

                return res.status(200).json({status: 200, message: 'Have fun!',token: token});
            }

        } catch (error) {
            return res.status(500).json({status: 500, message: error.message});
        }
    },

    /**
     * 
     * @param {verification_code} req object
     * @param {object} res object
     * @returns {object} success or error response object.
     */

    verifyCode: async function (req, res) {
        if(!req.body.verification_code) return res.status(400).json({status: 400, message: "Code is required."});

        try {
            let user = await UserModel.findOne({verification_code: req.body.verification_code}).exec();
            if(!user) return res.status(404).json({status: 404, message: "Code invalid."});

            if(user.verified) return res.status(400).json({status: 400, message: 'Email already verified.'});
            
            var expiry_date = new Date(user.created_on);
            expiry_date.setDate(expiry_date.getDate() + 2);

            if (expiry_date > new Date()) { //code is still valid.

                user.verified = true;
                user.verified_on = new Date();
                
                await user.save();

                return res.status(200).json({status: 200, message: 'Activation successful!'});

            } else {
                var verification_code = uuid.v4().split('').splice(0, 5).join('').toUpperCase();

                user.verification_code = verification_code;

                await user.save();
                        
                mailer.sendEmailVerificationMail(verification_code, user.email);

                return res.status(400).json({status: 400, message: 'Activation link expired. Enter the code just sent to your registered email address.'});
            }

        } catch (error) {
            return res.status(500).json({status: 500 ,message: error.message});
        }
    },

    /**
     * 
     * @param {email} req object
     * @param {object} res object
     * @returns {object} success or error response object.
     */

    requestPasswordReset: async function (req, res) {
        if(!req.body.email) return res.status(400).json({status: 400, message: "Email is required."});

        try {
            let user = await UserModel.findOne({email: req.body.email}).exec();
            if(!user) return res.status(404).json({status: 404, message: 'User not found.'});

            let token = uuid.v4()+uuid.v4();

            let update_user = await UserModel.findOneAndUpdate({email: req.body.email}, {$set: {password_reset_token: token, password_reset_token_expires: new Date() + 3600000}}).exec();
            if(!update_user) return res.status(500).json({status: 500, message: "Unable to update user."});

            mailer.sendPasswordResetMail(req.headers.host + '/verify_password/' + token, user.email);

            return res.status(200).json({status: 200, message: 'Please check your email inbox to proceed.'});

        } catch (error) {
            return res.status(500).json({status: 500, message: error.message});
        }
    },

    /**
     * 
     * @param {token} req object req.params.token
     * @param {object} res response object
     * @returns {object} success or error response object.
     */

    verifyPasswordResetToken: async function (req, res) {
        var token = req.params.token;

        try {
            let user = await UserModel.findOne({password_reset_token: token}).exec();
            if(!user) return res.status(404).json({status: 404, message: 'User not found.'});

            var expiry_date = new Date(user.password_reset_token_expires);
            var ONE_HOUR = 60 * 60 * 1000;

            if (((new Date) - expiry_date) > ONE_HOUR) return res.status(400).json({status: 400, message: 'This link has expired. Restart the password reset process.'});

            return res.status(200).json({status: 200, message: "Token valid", reset_token: token});

        } catch (error) {
            return res.status(500).json({status: 500, message: error.message});
        }
    },

    /**
     * 
     * @param {password, token} req object. password and token in request body.
     * @param {object} res response object
     * @returns {object} success or error response object.
     */

    changePassword: async function (req, res) {

        if(!req.body.password) return res.status(400).json({status: 400, message: "Password required."});

        try {
            let user = await UserModel.findOne({password_reset_token: req.body.token}).exec();
            if(!user) return res.status(404).json({status: 404, message: 'User not found.'});

            user.password_reset_token = "";
            user.password_reset_token_expires = "";
            user.password = req.body.password;

            await user.save();

            return res.status(200).json({status: 200, message: "Password change was successful."});

        } catch (error) {
            return res.status(500).json({status: 500, message: error.message});
        }
    },

    /**
     * 
     * @param {token} req object. takes bearer token of signed in user.
     * @param {object} res response object
     * @returns {object} success or error response object.
     */

    signOut: async function(req, res) {
        let blacklistarray = appstorage.get("blacklist");

        blacklistarray.push(req.verified.token);
        appstorage.set("blacklist", blacklistarray);

        return res.send({status: 200, message: "Sign out successful."});
    }
}