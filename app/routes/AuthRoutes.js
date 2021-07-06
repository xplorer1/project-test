var express = require('express');
var router = express.Router();
var AuthController = require('../controllers/AuthController');

var middlewares = require("../utils/middleware.js"); //for securing our routes with jwt.

router.post('/sign_in', AuthController.signIn);

router.get('/sign_out', middlewares.checkToken, AuthController.signOut);

router.post('/verify_code', AuthController.verifyCode);

router.post('/request_password_reset', AuthController.requestPasswordReset);

router.get('/verify_password_reset_token/:token', AuthController.verifyPasswordResetToken);

router.post('/change_password', AuthController.changePassword); 

router.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist' });
});

module.exports = router;