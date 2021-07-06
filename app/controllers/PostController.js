let PostModel = require('../models/PostModel');
let UserModel = require('../models/UserModel');

let cloudinary = require('cloudinary').v2; //for saving our file uploads.
let config = require('../../config');

cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret
});

let imageId = function () {
    return Math.random().toString(36).substr(2, 4);
};

module.exports = {

    /**
     * 
     * @param {post_body, (optional)post_image} req object post_body and (optional) post_image in multipart formdata.
     * @param {object} res success message.
     * @returns {object} success or error response object.
     */
    createPost: async function(req, res) {
        if(!req.body.post_body) return res.status(400).json({status: 400, message: "Post body required."});

        try {
            let user = await UserModel.findOne({email: req.verified.email}).exec();
            if(!user) return res.status(404).json({status: 404, message: 'User not found.'});

            let runCreatePost = async (image) => {
                let new_post = new PostModel();

                new_post.user = user._id;
                new_post.post_body = req.body.post_body;
                new_post.post_image = image;
                new_post.last_updated = new Date();

                await new_post.save();

                return res.status(200).json({status: 200, message: "Post successfully created."});
            }

            if(req.file && req.file.path) {
                cloudinary.uploader.upload(req.file.path, {public_id: "post/post_image" + imageId()},
                    async function(error, result) {
                        if(error) return res.status(500).json({message: error.message, status: 500 });
                        runCreatePost(result.secure_url);
                    }
                );
            } else {
                runCreatePost();
            }

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500,
            });
        }
    },

    /**
     * 
     * @param {post_id} req object takes a post_id as params.
     * @param {object} res post object
     * @returns {object} success or error response object.
     */
    getPost: async function(req, res) {
        try {
            let user = await UserModel.findOne({email: req.verified.email}).exec();
            if(!user) return res.status(404).json({status: 404, message: 'User not found.'});

            let post = await PostModel.findOne({_id: req.params.post_id}).populate("user", "-password -password_reset_token_expires -password_reset_token -verification_code -__v").exec();
            if(!post) return res.status(404).json({status: 404, message: "Post not found."});

            return res.status(200).json({status: 200, data: post});

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500,
            });
        }
    },

    /**
     * 
     * @param {*} req object.
     * @param {object} res posts object
     * @returns {object} success or error response object.
     */

    listPosts: async function(req, res) {
        try {
            let user = await UserModel.findOne({email: req.verified.email}).exec();
            if(!user) return res.status(409).json({status: 409, message: 'User not found.'});

            let posts = await PostModel.find({}).populate("user", "-password -password_reset_token_expires -password_reset_token -verification_code -__v").exec();

            return res.status(200).json({status: 200, data: posts});

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500,
            });
        }
    },

    /**
     * 
     * @param {post_id} req object takes a post_id as params.
     * @param {object} res success message.
     * @returns {object} success or error response object.
     */
    updatePost: async function(req, res) {
        try {
            let user = await UserModel.findOne({email: req.verified.email}).exec();
            if(!user) return res.status(409).json({status: 409, message: 'Account exists.'});

            let post = await PostModel.findOne({_id: req.params.post_id}).exec();
            if(!post) return res.status(404).json({message: "Post not found."});

            let runUpdate = async (image) => {

                post.post_body = req.body.post_body ? req.body.post_body : post.post_body;
                post.post_image = image;
                post.last_updated = new Date();

                await post.save();

                return res.status(200).json({status: 200, message: "Post successfully updated."});
            }

            if(req.file && req.file.path) {
                cloudinary.uploader.upload(req.file.path, {public_id: "post/post_image" + imageId()},
                    async function(error, result) {
                        if(error) return res.status(500).json({message: 'Unable to process your request.', error: error });
                        runUpdate(result.secure_url);
                    }
                );
            } else {
                runUpdate(post.post_image);
            }

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500,
            });
        }
    },
    
    /**
     * 
     * @param {post_id} req object takes a post_id as params.
     * @param {object} res success message
     * @returns {object} success or error response object.
     */

    deletePost: async function(req, res) {
        try {
            let user = await UserModel.findOne({email: req.verified.email}).exec();
            if(!user) return res.status(404).json({status: 404, message: 'Account exists.'});

            let post = await PostModel.findOne({_id: req.params.post_id}).populate("user").populate("comments.sender").exec();
            if(!post) return res.status(404).json({message: "Post not found.", status: 404});

            let delete_post = await PostModel.deleteOne({_id: req.params.post_id}).exec();
            if(!delete_post.deletedCount) return res.status(500).json({message: "Unable to delete post.", status: 500});

            return res.status(200).json({status: 200, message: "Post successfully deleted."});

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: 500,
            });
        }
    }
}