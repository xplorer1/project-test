require('dotenv').config();
const serverless = require("serverless-http");
const express = require("express");
const app = express();

const cors = require('cors'); //for handliing cors configuration.
const appstorage = require("./app/utils/nodepersist"); //for storing invalidated jwt tokens.

const mongoose = require('mongoose'); // for working w/ our database
const config = require('./config');

mongoose.Promise = global.Promise;
mongoose.connect(config.database, { useUnifiedTopology: true, useFindAndModify: false, useNewUrlParser: true });

let conn = mongoose.connection;
conn.on('error', function(err){
    console.log('mongoose connection error:', err.message);
});

if(!appstorage.get("blacklist")) { //for setting the stage for storing invalidated tokens.
    appstorage.set("blacklist", []);
}

app.use(cors());

//for parsing and receiving json payloads.
app.use(express.urlencoded({ limit: '5mb', extended: true}));
app.use(express.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'x-access-token,X-Requested-With,Content-Type,Authorization');
    res.setHeader('X-Powered-By', 'Lucky Lucciano');
    next();
});

//import our routes.
let AuthRoutes = require('./app/routes/AuthRoutes');
let UserRoutes = require('./app/routes/UserRoutes');
let PostRoutes = require('./app/routes/PostRoutes');

app.use(function(req, res, next) {
    console.log(req.method, req.url); //logs each request to the console.
    next(); 
});

app.get("/", function(req, res) {
    return res.status(200).json("You have arrived. Do fast and get out!!. Angrily visit the app documentation to learn how to use the APIs.");
});

//set our app to handling our routes.
app.use("/api/auth", AuthRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/post", PostRoutes);

app.use(function(req, res) {
    return res.status(404).json({ message: 'The url you visited does not exist.' });
});

//app.listen(config.port, () => console.log(`Magic happening on port ${config.port}!`));

module.exports.handler = serverless(app);