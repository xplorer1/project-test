const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const multer = require('multer');
const upload = multer({dest: '../../tmp/'}); //for handling multipart form data.

const middlewares = require("../utils/middleware.js"); //for securing our routes with jwt.

router.use(middlewares.checkToken);
router.route('/')
    .post(upload.single('post_image'), PostController.createPost) //specifies that this route accepts multipart form data.
    .get(PostController.listPosts);

router.route('/:post_id')
    .get(PostController.getPost)
    .put(upload.single('post_image'), PostController.updatePost)//specifies that this route accepts multipart form data.
    .delete(PostController.deletePost)
    
router.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist.' });
});

module.exports = router;