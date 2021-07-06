# Project Title

This is a simple nodejs project. It supports the following actions:

- Registration & login with email & password
- Authentication with JWT
- Send an email to a user after registration
- Password reset
- Publish a post
- Fetch a post
- Delete a post
- Edit a post

- Note: A user should be able to upload images

## Requirements

For development, you will only need Node.js and a node global package, npm, installed in your environement.

### Installation

Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v12.11.3

    $ npm --version
    6.14.0

# Getting this app running locally.

## Run Locally

To run this app, you must have a nodejs of atleast v10.x.

1.  Clone this repo:

        git clone https://github.com/xplorer1/talentql.git

1.  Change into the cloned app:

        cd talentql/

1.  Install depedencies:

        npm install

## Configure app

Open `./config.js` in the root path then edit it with your settings. You will need:

- A cloudinary credentials for image upload.;
- Elastic mail credentials for sending mails;
- Database.;

1.  Run the sample with `node` or `nodemon` 

        node server.js

1.  Make requests to the application at [http://localhost:9000][].

1. API documentation is at https://documenter.getpostman.com/view/13616694/TzJycayC

[nodejs]: https://nodejs.org/