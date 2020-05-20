const express = require('express');
const cors = require('cors');

// Only allows this domain:port pair to access the resource/data on the server.
const whitelist = ['http://localhost:3000', 'https://localhost:3443'];

var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    // console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

// Applied to GET operation only, and it will accept all origins (*).
exports.cors = cors();

// Applied to POST, PUT, DELETE operations, and they will only accept whitelist domains.
exports.corsWithOptions = cors(corsOptionsDelegate);