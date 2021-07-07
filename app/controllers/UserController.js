let UserModel = require('../models/UserModel');

let mailer = require('../utils/mailer');
let uuid = require('node-uuid');

module.exports = {
    /**
     * 
     * @param {email,password} req object
     * @param {object} res object
     * @returns {object} success or error response object
     */

    signUp: async function(req, res) {
        if(!req.body.email || !req.body.password) return res.status(400).json({status: 400, message: "Email and password required."});

        try {
            let userexists = await UserModel.findOne({email: req.body.email.trim().toLowerCase()}).exec();
            if(userexists) return res.status(409).json({status: 409, message: 'Account exists.'});

            var verification_code = uuid.v4().split('').splice(0, 5).join('').toUpperCase();

            var user = new UserModel({
                email : req.body.email,
                verification_code: verification_code,
                password: req.body.password
            });

            await user.save();

            mailer.sendEmailVerificationMail(verification_code, req.body.email);

            return res.status(200).json({status: 200, message: "Account has been created. Check your mail for verification code."});

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500,
            });
        }
    },

    /**
     * 
     * @param {no request body or params} req uses bearer token of user.
     * @param {*} res responds with the user's details.
     * @returns error or success response object.
     */

    getUser: async function(req, res) {
        try {
            let user = await UserModel.findOne({email: req.verified.email}, {"password": false, "verification_code": false}).exec();
            if(!user) return res.status(404).json({status: 404, message: 'User not found.'});

            return res.status(200).json({status: 200, data: user});

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500,
            });
        }
    },

    /**
     * 
     * @param {takes the user's object} req user object
     * @param {*} res returns with successful response object.
     * @returns error or success response object.
     */

    updateUser: async function(req, res) {
        try {
            let user = await UserModel.findOne({email: req.verified.email}).exec();
            if(!user) return res.status(404).json({status: 404, message: 'User not found.'});

            user.email = req.body.email ? req.body.email : user.email;
            user.password = req.body.password ? req.body.password : user.password;

            await user.save();

            return res.status(200).json({status: 200, message: "Update was successful"});

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500,
            });
        }
    },

    /**
     * 
     * @param {no request body or params} req uses bearer token of user.
     * @param {*} res responds with the user's details.
     * @returns error or success response object.
     */

    deleteUser: async function(req, res) {
        try {
            let user = await UserModel.findOne({email: req.verified.email}).exec();
            if(!user) return res.status(404).json({status: 404, message: 'User not found.'});

            let delete_account = await UserModel.deleteOne({email: req.verified.email}).exec();
            if(!delete_account.deletedCount) return res.status(500).json({message: "Unable to delete account.", status: 500});

            return res.status(200).json({status: 200, message: "Account deleted!"});

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500,
            });
        }
    }
}