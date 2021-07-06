let chai = require('chai');
let chaiHttp = require('chai-http');
let uuid = require('node-uuid');
let fs = require('fs');
let path = require('path');

let server = require('../../server');
let should = chai.should();
chai.use(chaiHttp);

let PostModel = require('../models/PostModel');
let UserModel = require('../models/UserModel');

let user_credentials = {
    "email" : "spartan.scorpion@zetmail.com",
    "password": "STWV6R$IYS6&%V80D9VL0M"
};

let authenticated_user;
let verification_code = uuid.v4().split('').splice(0, 5).join('').toUpperCase();
let pwd_reset_token = uuid.v4();

describe('User/Auth', () => {
    before((done) => { //Before each test we empty the database.
        UserModel.remove({}, (err) => {
            done();
        });
    });

    before((done) => { //Before each test we empty the posts document.
        PostModel.remove({}, (err) => {
            done();
        });
    });

    before(done => { //add a default user to the database...test signup.
        chai
            .request(server)
            .post("/api/user/sign_up")
            .send(user_credentials)
            .end((err, res) => {
                if(err) console.log(err.message);

                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Account has been created. Check your mail for verification code.');
                done();
            });
    });

    before((done) => { //We save a specific verification_code so we can test the verify token route
        UserModel.findOneAndUpdate({email: user_credentials.email}, {$set: {verification_code: verification_code}}, (err) => {
            if(err) console.log(err.message);
            done();
        });
    });

    before(done => { //then we verify the user's account using the specific token.
        let payload = {verification_code: verification_code};
        chai
            .request(server)
            .post("/api/auth/verify_code")
            .send(payload)
            .end((err, res) => {
                if(err) console.log(err.message);

                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message');
                res.body.should.have.property('message').eql('Activation successful!');

                done();
            });
    });

    before(done => { //then we sign the user in and save the token to authenticated requests.
        chai
            .request(server)
            .post("/api/auth/sign_in")
            .send(user_credentials)
            .end((err, res) => {
                if(err) console.log(err.message);

                authenticated_user = res.body.token;

                res.body.should.be.a('object');
                res.body.should.have.property('token');
                res.should.have.status(200);
                done();
            });
    });

    /*
    * Test the /GET user route
    */

    describe('/GET user', () => {
      it('should GET the details of the logged in user', (done) => { //should return 200 with the user object.
        chai.request(server)
            .get('/api/user')
            .set({ Authorization: `Bearer ${authenticated_user}`})
            .end((err, res) => {
                if(err) console.log(err.message);

                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('data');
                done();
            });
        });
    });

    /*
    * Test the /POST sign_up route
    */
    describe('/POST user sign_up', () => {
        it('it should not create a user without password field', (done) => {
            let new_user = {
                email: "john.doe@dropjar.com"
            }

        chai.request(server)
            .post('/api/user/sign_up')
            .send(new_user)
            .end((err, res) => { //should return 404 because password is not found.
                if(err) console.log(err.message);

                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('message');
                res.body.should.have.property('message').eql('Email and password required.');
                done();
            });
        });

        it('it should create a user ', (done) => {
            let new_user = {
                email: "john.doe@dropjar.com",
                password: "Oeiweitn323IKKw"
            }

            chai.request(server)
                .post('/api/user/sign_up')
                .send(new_user)
                .end((err, res) => { // a new user should be created succesfully.
                    if(err) console.log(err.message);

                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Account has been created. Check your mail for verification code.');
                    done();
                });
            });
    });

    /*
    * Test the /PUT update user route
    */
    describe('/PUT user', () => {
        it('it should UPDATE a user given the logged in user"s token and user details.', (done) => {

            chai.request(server)
                .put('/api/user')
                .set({ Authorization: `Bearer ${authenticated_user}`})
                .send({email: user_credentials.email, password: "323##@dsdifweDEEs"})
                .end((err, res) => {
                    if(err) console.log(err.message);

                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Update was successful');
                    done();
                });
        });
    });

    /*
    * Test the /post start password reset route.
    */

    describe('/POST request password reset', () => {
        it('it should start the process for reseting a user"s password.', (done) => {
            let user = {
                email: user_credentials.email
            }

            chai.request(server)
                .post('/api/auth/request_password_reset')
                .send(user)
                .end((err, res) => {
                    if(err) console.log(err.message);
                
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message');
                    res.body.should.have.property('message').eql('Please check your email inbox to proceed.');

                    done();
                });
            });
    });

    /*
    * Save a token in the password_reset_token for us to test the reset password endpoints.
    */

    beforeEach((done) => { //We save a specific password_reset_token so we can test the verify token route
        UserModel.findOneAndUpdate({email: user_credentials.email}, {$set: {password_reset_token: pwd_reset_token}}, (err) => {
            if(err) console.log(err.message);

            done();
        });
    });

    /*
    * Test the /get verify token is still valid route.
    */

    describe('/POST verify password reset token', () => {
        it('it should that a password reset token is still valid.', (done) => {
            console.log("pwd_reset_token vcode: ", pwd_reset_token);
    
            chai.request(server)
                .get('/api/auth/verify_password_reset_token/' + pwd_reset_token)
                .end((err, res) => {
                    if(err) console.log(err.message);

                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message');
                    res.body.should.have.property('message').eql('Token valid');
                    done();
                });
            });
    });

    /*
    * Test the /post actual password reset route.
    */

    describe('/POST request password reset', () => {
        it('it should change the password to the new one.', (done) => {
            let user = {
                password: "123456",
                token: pwd_reset_token
            }

            chai.request(server)
                .post('/api/auth/change_password')
                .send(user)
                .end((err, res) => {
                    if(err) console.log(err.message);

                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message');
                    res.body.should.have.property('message').eql('Password change was successful.');
                    done();
                });
            });
    });

    /*
    * Test the /get create post.
    */

    describe('/POST post create post', () => {
        it('it should not create a post without at least post_body', (done) => {
            let postbody = {
                post_body: ""
            }
    
            chai
                .request(server)
                .post("/api/post")
                .set({ Authorization: `Bearer ${authenticated_user}`})
                .set("Content-Type", "multipart/form-data")
                .field("post_body", postbody.post_body)
                .end((err, res) => {
                    if(err) console.log(err.message);
    
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Post body required.');
                    done();
                });
        });

        it('it should create a post using only post_body ', (done) => {
            let postbody = {
                post_body: "In 1971, Roger and Carolyn Perron move into a farmhouse in Harrisville, Rhode Island, with their five daughters Andrea, Nancy, Christine, Cindy, and April. Their dog Sadie refuses to enter the house, and Nancy and Christine, while playing a game of 'hide and clap', find a boarded-up entrance to the cellar."
            }
    
            chai
                .request(server)
                .post("/api/post")
                .set({ Authorization: `Bearer ${authenticated_user}`})
                .set("Content-Type", "multipart/form-data")
                .field("post_body", postbody.post_body)
                .end((err, res) => {
                    if(err) console.log(err.message);
    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Post successfully created.');
                    done();
                });
        });

        it('it should create a user using both post_image post_body ', (done) => {
            let postbody = {
                post_body: "In 1971, Roger and Carolyn Perron move into a farmhouse in Harrisville, Rhode Island, with their five daughters Andrea, Nancy, Christine, Cindy, and April. Their dog Sadie refuses to enter the house, and Nancy and Christine, while playing a game of 'hide and clap', find a boarded-up entrance to the cellar."
            }
    
            chai
                .request(server)
                .post("/api/post")
                .set({ Authorization: `Bearer ${authenticated_user}`})
                .set("Content-Type", "multipart/form-data")
                .field("post_body", postbody.post_body)
                .attach("post_image", path.resolve(__dirname, "../data/upload.jpg"))
                .end((err, res) => {
                    if(err) console.log(err.message);
    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Post successfully created.');
                    done();
                });
        });
    });

    /*
    * Test the /get all post route.
    */

    describe('/GET posts', () => {
        it('it should GET all the posts', (done) => {
              chai.request(server)
              .get('/api/post')
              .set({ Authorization: `Bearer ${authenticated_user}`})
              .end((err, res) => {
                  
                    res.should.have.status(200);
                    res.body.should.have.property('data')
                    res.body.data.should.be.a('array');
                done();
              });
        });
    });

    /*
    * Test the /get post by :id route.
    */

    describe('/GET/:id post', () => {
        it('it should GET a post by the given id', (done) => {
            let new_post = new PostModel({ post_body: "The Lord of the Rings."});

            new_post.save((err, post) => {
                chai.request(server)
                    .get('/api/post/' + post._id)
                    .set({ Authorization: `Bearer ${authenticated_user}`})
                    .send(post)
                    .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('data');
                        done();
                    });
            });
  
        });
    });

    describe('/PUT/:id post', () => {
        it('it should UPDATE a post given the id', (done) => {
            let new_post = new PostModel({ post_body: "One of the important task which most of the developers ignores ( i used to ignore too ) is writing unit tests for your code."});

            new_post.save((err, post) => {
                chai.request(server)
                    .put('/api/post/' + post._id)
                    .set({ Authorization: `Bearer ${authenticated_user}`})
                    .set("Content-Type", "multipart/form-data")
                    .field("post_body", post.post_body)
                    .attach("post_image", path.resolve(__dirname, "../data/upload.jpg"))
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message').eql('Post successfully updated.');
                        done();
                    });
            });
        });
    });

    /*
    * Test the /delete post route.
    */

    describe('/delete/:id post', () => {
        it('it should Delete a post by the given id', (done) => {
            let new_post = new PostModel({ post_body: "The Lord of the Rings"});

            new_post.save((err, post) => {
                chai.request(server)
                    .delete('/api/post/' + post._id)
                    .set({ Authorization: `Bearer ${authenticated_user}`})
                    .send(post)
                    .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                            res.body.should.have.property('message');
                        done();
                    });
            });
  
        });
    });

    /*
    * Test the /delete user account route.
    */

    describe('/Delete delete account.', () => {
        it('it should delete user"s account.', (done) => {
    
            chai.request(server)
                .delete('/api/user')
                .set({ Authorization: `Bearer ${authenticated_user}`})
                .end((err, res) => {
                    if(err) console.log(err.message);

                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message');
                    res.body.should.have.property('message').eql('Account deleted!');
                    done();
                });
            });
    });

    /*
    * Test the /get sign out route.
    */

    describe('/GET sign out', () => {
        it('it should sign the user out.', (done) => {
    
            chai.request(server)
                .get('/api/auth/sign_out')
                .set({ Authorization: `Bearer ${authenticated_user}`})
                .end((err, res) => {
                    if(err) console.log(err.message);

                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message');
                    res.body.should.have.property('message').eql('Sign out successful.');
                    done();
                });
            });
    });

});