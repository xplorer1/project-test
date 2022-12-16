var express = require('express');
var router = express.Router();
var UserController = require('../controllers/UserController');

router.post('/sign_up', UserController.signUp);

router.route('/')
    .get(UserController.getUser)
    .put(UserController.updateUser)
    .delete(UserController.deleteUser);

module.exports = router;