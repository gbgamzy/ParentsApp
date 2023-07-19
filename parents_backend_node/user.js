const express=require('express');
const router = express.Router();
const mongoose = require('mongoose');



// import models from model.js
const { Value, Image, User, Device, Policy } = require('./model');

// create user 
router.post('/login', async (req, res) => { 
    try {
        // create a new User
        var user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email, 
            phone: req.body.phone
        });
        // save user
        var result = await user.save();
        console.log(result);
        res.statusCode = 200;
        res.send({
            message: "User created successfully",
            body: result
        });
    }
    catch (e) {
        // if user already exists
        if (e.code == 11000) {
            console.log("User already exists");
            var user = User.find({ userPhone: req.body.phone });
            res.statusCode = 200;
            res.send({
                message: "User already exists",
                body: user
            });
        }
        console.log(e);
        res.statusCode = 400;
        res.send({
            message: "Internal server error",
            body: e
        });
    }
});

router.delete('/:userId', async (req, res)  => {
    // delete user
    try {
        var user = await User.deleteOne({ _id: req.params.userId });
        console.log(user);
        res.statusCode = 200;
        res.send({
            message: "User deleted successfully",
            body: user
        });
    }
    catch (e) {
        console.log(e);
        res.statusCode = 400;
        res.send({
            message: "Internal server error",
            body: e
        });
    }
    
});

// login with authorization header
router.get('/login', async (req, res) => { 
    console.log("Logging in");
    try {
        // get user
        
        var authHeader = req.headers.authorization;
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');

        // Extract the username and password from the decoded string
        const [username, password] = auth.split(':');
        console.log(username);
        var user = await User.find({ userPhone: username }).populate('userAppointments');
        console.log(user)
        res.statusCode = 200;
        if (user.length == 0) {
            res.statusCode = 204;
            res.send({
                message: "User does not exist",
                body: {}
            });
            
        }
        else {
            res.send({
                message: "User logged in successfully",
                body: user[0]
            });
        }
        
    }
    catch (e) {
        console.log(e);
        res.statusCode = 400;
        res.send({
            message: "Internal server error",
            body: e
        });
    }
});

// get devices of a user
router.get('/:userId/device', async (req, res) => { 
    // get user and populate devices
    try {
        var user = User.findById(req.params.userId).populate({
            path: 'devices',
            populate: {
                path: 'policy',
                model: 'Policy'
            }
        });
    }
    catch (e) {
        console.log(e);
        res.statusCode = 400;
        res.send({
            message: "Internal server error",
            body: e
        });
    }
});

// add a token to user
router.post('/:userId/token', async (req, res) => { 
    // update user and add 1 to tokenCount
    try {
        var user = await User.updateOne({ _id: req.params.userId }, { $inc: { tokenCount: 1 } });
        res.statusCode = 200;
        res.send({
            message: "Token added successfully",
            body: user
        });
    }
    catch (e) {
        console.log(e);
        res.statusCode = 400;
        res.send({
            message: "Internal server error",
            body: e
        });
    }
});



// get a particular device of a user
router.get('/:userId/device/:deviceId', async (req, res) => { 
    // get user and populate devices
    try {
        var user = User.findById(req.params.userId).populate({
            path: 'devices',
            match: { _id: req.params.deviceId },
            populate: {
                path: 'policy',
                model: 'Policy'
            }
        });
        console.log(user);
        res.statusCode = 200;
        res.send({
            message: "Device found",
            body: user
        });
    }
    catch (e) {
        console.log(e);
        res.statusCode = 400;
        res.send({
            message: "Internal server error",
            body: e
        });
    }
});

// update device of a user
router.put('/:userId/device/:deviceId', async (req, res) => { 
    // get device by deviceId and update from body
    try {
        var device = req.body.device;
        await Device.updateOne({ _id: req.params.deviceId }, {device});
        console.log(device);
        res.statusCode = 200;
        res.send({
            message: "Device updated successfully",
            body: device
        });
    }
    catch(e) {
        console.log(e);
        res.statusCode = 400;
        res.send({
            message: "Internal server error",
            body: e
        });
    }
});

// update user details
router.put('/:userId', async (req, res) => { 
    
});





module.exports = router;