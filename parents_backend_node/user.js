const express=require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ama = require('./ama');
const fs = require('fs');
const path = require('path');




// import models from model.js
const { Value, Image, User, Device, Policy } = require('./model');

// get image
router.get('/image/:image', async (req, res) => { 
    console.log("Getting image");
    try {
        const image = await Image.findOne({name: req.params.image});
        res.statusCode = 200;
        res.send(image.image);
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

// upload image
router.post('/image/:image', async (req, res) => { 
    console.log("Uploading image");
    if (!req.files.file) {
        return res.status(400).send('No image data found');
    }
    
    try {
        
        const file = req.files.file;

        // Do something with the file
        console.log(file.name);
        console.log(file.data);

        const imageSize = Buffer.byteLength(file.data, 'utf8');
        console.log(`Image size: ${imageSize} bytes`);

        // upload image to database with image._id = req.params.image
        const image = await Image.findOne({ name: req.params.phone });
        if (image) {
            await Image.updateOne({ _id: req.params.image }, {
                image: file.data
            });
        }
        else {
            var i = new Image({
                name: req.params.image,
                image: file.data
            })
            await i.save();
        }
        res.statusCode = 200;
            res.send({
                message: "Image uploaded successfully",
                body: file
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


// get otp
router.get('/:phone/otp', async (req, res) => { 
    try {
        // generate 6 digit random otp
        // var otp = Math.floor(100000 + Math.random() * 900000);
        console.log("Getting OTP")
        console.log(req.params.phone);
        var otp = '123456';

        // check if user with this phone number exists
        var user = await User.findOne({ phone: req.params.phone });
        if (!user) { 
            var user = new User({
                phone: req.params.phone,
                otp: otp,
                otpExpires: Date.now() + 300000,
                otpTimestamp: Date.now()
            });
        }
        else {
            if (Date.now() - user.otpTimestamp > 90000) {
                user.otp = otp;
                user.otpExpires = Date.now() + 300000;
                user.otpTimestamp = Date.now();
            }
            else {
                res.statusCode = 400;
                res.send({
                    message: "OTP already sent",
                    body: null
                });
                return;

            }

            
        }
        await user.save();

        
        res.statusCode = 200;
        res.send({
            message: "OTP sent to "+req.params.phone
        });

        
    }
    catch (e) {
        console.log(e);
        res.statusCode = 500;
        res.send({
            message: "Internal server error",
            body: e
        });

    }
});

// verify otp
router.post('/:phone/otp', async (req, res) => {    
    try {
        console.log("Verifying OTP")
        console.log(req.body);
        var user = await User.findOne({ phone: req.params.phone });
        if (!user) {
            throw "User not found";
        }
        if (user.otp == req.body.otp) {
            if (Date.now() - user.otpExpires > 300000) { 
                res.statusCode = 400;
                res.send({
                    message: "OTP expired",
                    body: null
                });
                return;
            }
            if(!user.firstName)
                res.statusCode = 201;
            else
                res.statusCode = 200;
            res.send({
                message: "OTP verified",
                body: user
            });
        }
        else {
            res.statusCode = 400;
            res.send({
                message: "Wrong OTP",
                body: null
            });
        }
    }
    catch (e) {
        console.log(e);
        res.statusCode = 500;
        res.send({
            message: "Internal server error",
            body: e
        });
    }

});

// put request to update user with userId in params
router.put('/:userId', async (req, res) => { 
    try {
        var user = await User.findById(req.params.userId);
        if (!user) { 
            throw "User not found";
        }
        if (req.body.firstName) { 
            user.firstName = req.body.firstName;
        }
        if (req.body.lastName) {
            user.lastName = req.body.lastName;
        }
        if (req.body.email) {
            user.email = req.body.email;
        }
        if (req.body.phone) {
            user.phone = req.body.phone;
        }
        await user.save();
        res.statusCode = 200;
        res.send({
            message: "User updated",
            body: user
        });

    }
    catch (err) {
        console.log(err);
        res.statusCode = 500;
        res.send({
            message: err,
            body:err
        });
    }
})

// 

// get user 
router.post('/userexists', async (req, res) => { 
    try {
       //check if user exists by using either phone or email
        var user;
        if (req.body.phone != "NA") {
            user = await User.find({ phone: req.body.phone });
        }
        else if (req.body.email != "NA") {
            user = await User.find({ email: req.body.email });
        }
        if (user.length != 0) { 
            console.log(user);
            res.statusCode = 200;
            res.send({
                message: "User found",
                body: user
            });
            return;
        } 
        else {
            res.statusCode = 200;
            res.send({
                message: "User not found",
                body: null
            });
            return;
        }
    }
    catch (e) {
        console.log(e);
        res.statusCode = 500;
        res.send({
            message: "Internal server error",
            body: null
        });
    }
});

// create user 
router.post('/login', async (req, res) => {
    try {
        // create a new User
        console.log(req.body)
        // check if request body contains either phone or email
        if (req.body.phone == "NA" && req.body.email == "NA") {
            res.statusCode = 400;
            res.send({
                message: "Phone or email required",
                body: null
            });
            return;
        }
        // check if request body contains both phone and email
        if (req.body.email != "NA") {
            var user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
            });
            user.email = req.body.email;
            await user.save();
        }
        else if (req.body.phone != "NA") { 
            var user = await User.findOne({ phone: req.body.phone });
            if (!user) {
                throw "User not found";
            }
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            await user.save();

        }
        
        
        // save user
        res.statusCode = 200;
        res.send({
            message: "User created successfully",
            body: result
        });
    }
    catch (e) {
        console.log(e.keyValue);
        // if user already exists
        if (e.code == 11000) {
            console.log("User already exists");
            var user;
            // if e.keyValue.phone exists
            if (e.keyValue.phone) { 
                user = await User.findOne({ phone: req.body.phone });
            }
            else {
                user = await User.findOne({ email: req.body.email });
            }
            

            
            console.log(user);
            res.statusCode = 200;
            // convert user to json format
            
            user = JSON.parse(JSON.stringify(user));
            
            res.statusCode = 200;
            res.send({
                message: "User already exists",
                body: user
            });
            return;
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

// get devices of a user
router.get('/:userId/device', async (req, res) => { 
    // get user and populate devices
    console.log("Getting devices for user" + req.params.userId);
    try {
        var user = await User.findById(req.params.userId).populate({
            path: 'devices',
            populate: {
                path: 'policy',
                model: 'Policy'
            }
        });
        console.log(user.devices);
        res.statusCode = 200;
        res.send({
            message: "Devices found",
            body: user.devices,
            devices: user.devices
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
        var userId = req.params.userId;
        var user = await User.updateOne({ _id: req.params.userId }, { $inc: { tokenCount: 1 } });
        await createEnrollmentToken(userId);
        res.statusCode = 200;
        res.send({
            message: "Token added successfully, a device will appear in a while",
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
        var device = await Device.findById(req.params.deviceId).populate({
            path: 'policy',
            model: 'Policy'
            // match: { _id: req.params.deviceId },
            // populate: {
            //     path: 'policy',
            //     model: 'Policy'
            // }
        });
        console.log(device);
        res.statusCode = 200;
        res.send({
            message: "Device found",
            body: device
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


// get enrollmentTokens of a user
router.get('/:userId/enrollmentToken', async (req, res) => {
    try {
        // check if tokenCount of user is greater than 0
        var user = await User.findById(req.params.userId);
        for (let index = 0; index < user.tokenCount; index++) {
            await createEnrollmentToken(req.params.userId);
        }
        res.statusCode = 200;
        res.send({
            message: "Enrollment tokens created successfully",
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

// put request taking in userId and deviceId as params to update device
router.put('/:userId/device/:deviceId', async (req, res) => {
    try {
        var device = await Device.findById(req.params.deviceId);
        device.nickname = req.body.nickname;
        device.apps = req.body.apps;
        await device.save();
        res.statusCode = 200;
        res.send({
            message: "Device updated successfully",
            body: device
        });
    }
    catch (e) {
        res.statusCode = 400;
        res.send({
            message: "Internal server error",
            body: e
        });
    }
});

// put request taking in userId, deviceId and policyId as params to update policy
router.put('/:userId/device/:deviceId/policy/:policyId', async (req, res) => { 
    try {
        
        var policy = await Policy.findById(req.params.policyId);
        policy.adjustVolumeDisabled = req.body.policyItself.adjustVolumeDisabled??policy.adjustVolumeDisabled;
        policy.installAppsDisabled = req.body.policyItself.installAppsDisabled ?? policy.installAppsDisabled;
        policy.mountPhysicalMediaDisabled = req.body.policyItself.mountPhysicalMediaDisabled ?? policy.mountPhysicalMediaDisabled;
        policy.outgoingCallsDisabled = req.body.policyItself.outgoingCallsDisabled ?? policy.outgoingCallsDisabled;
        policy.usbFileTransferDisabled = req.body.policyItself.usbFileTransferDisabled ?? policy.usbFileTransferDisabled;
        policy.bluetoothDisabled = req.body.policyItself.bluetoothDisabled ?? policy.bluetoothDisabled;
        policy.playStoreMode = req.body.policyItself.playStoreMode ?? policy.playStoreMode;
        policy.applications = req.body.policyItself.applications ?? policy.applications;
        policy.locationMode = req.body.policyItself.locationMode ?? policy.locationMode;
        policy.advancedSecurityOverrides = req.body.policyItself.advancedSecurityOverrides ?? policy.advancedSecurityOverrides;
        
        var result = await ama.updatePolicy(req.body.policyItself);
        if (result == false) {
            throw "Error in updating policy";
        }
        await policy.save();
        res.statusCode = 200;
        res.send({
            message: "Policy updated successfully",
            body: policy
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


async function createEnrollmentToken(userId) {
    var flag = 0;
    var policyId = "", deviceId = "";
    try {
        // check if tokenCount of user is greater than 0
        var user = await User.findById(userId);
        if (user.tokenCount <= 0) {
            throw new Error("User has no tokens left");
        }
        
        var policy = new Policy({
        applications: [],
        adjustVolumeDisabled: false,
        installAppsDisabled: false,
        factoryResetDisabled: true,
        mountPhysicalMediaDisabled: false,
        outgoingCallsDisabled: false,
        usbFileTransferDisabled: false,
        bluetoothDisabled: false,
        playStoreMode: "BLACKLIST",
        advancedSecurityOverrides: {
            "untrustedAppsPolicy": "DISALLOW_INSTALL",
            "developerSettings": "DEVELOPER_SETTINGS_DISABLED"
        }
        })
        
        await policy.save();
        
    var res1 = await ama.createPolicy(policy._id);
        if (res1 == false) {
        throw new Error("Error in creating policy");
    }
    policy.name = ama.policyPrefix + policy._id;
        await policy.save();
    flag = 1;
    policyId = policy._id;
    userId
    var user = await User.findById(userId);
    // get size of devices array
    var numberOfDevices = user.devices.length;
    var device = new Device({
        nickname: "Device " + (numberOfDevices + 1),
        // set createdOn as now date and time
        createdOn: new Date(),
        currentlyEnrolled: false,
        policy: policy._id,
        // random 6 digit number as otp
        otp: Math.floor(100000 + Math.random() * 900000),
    })
    await device.save();
    user.devices.push(device._id);    
        await user.save();
        flag = 2;
        deviceId = device._id;
    let r = await ama.getEnrollmentToken(policy._id);
    console.log(r);
    device.qrCode = r;
    device.save()
    if(r == null) {
        throw new Error("Error in generating enrollment token");
    }
    else {
        await User.updateOne({ _id: userId }, { $inc: { tokenCount: -1 } });
        return true;
    }
    }
    catch (e) {
        if (flag >= 1) {
            // delete the created policy using policyId
            await Policy.deleteOne({ _id: policyId });
        }
        if (flag == 2) { 
            // delete the created device using deviceId and pop it out of the user's devices array using deviceId
            await Device.deleteOne({ _id: deviceId });
            await User.updateOne({ _id: userId }, { $pull: { devices: deviceId } });

        }
            
        console.log(e);
        throw e;
    }
}





module.exports = router;
