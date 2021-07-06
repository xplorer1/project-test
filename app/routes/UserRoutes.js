var express = require('express');
var router = express.Router();
var UserController = require('../controllers/UserController');

var middlewares = require("../utils/middleware.js"); //for securing our routes with jwt.

router.post('/sign_up', UserController.signUp);

router.use(middlewares.checkToken);

router.route('/')
    .get(UserController.getUser)
    .put(UserController.updateUser)
    .delete(UserController.deleteUser);

router.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist.' });
});

module.exports = router;