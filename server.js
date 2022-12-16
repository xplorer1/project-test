const express = require("express");
const app = express();

const cors = require('cors'); //for handliing cors configuration.

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

app.get("/", function(req, res) {
    return res.status(200).json("You have arrived. Do fast and get out!!. Angrily visit the app documentation to learn how to use the APIs.");
});

app.use(function(req, res) {
    return res.status(200).json({ message: 'Welcome to the codebase.' });
});

app.listen(config.port, () => console.log(`Magic happening on port ${config.port}!`));