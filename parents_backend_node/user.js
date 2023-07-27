const express=require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ama = require('./ama');



// import models from model.js
const { Value, Image, User, Device, Policy } = require('./model');

// get otp
router.post('/getotp', async (req, res) => { 
    try {
        // generate 6 digit random otp
        // var otp = Math.floor(100000 + Math.random() * 900000);
        var otp = '123456';
        // check if user with this phone number exists
        var user = await User.find({ phone: req.body.phone });
        if (user.length == 0) { 
            var user = new User({
                phone: req.body.phone,
                otp: otp
            });
        }
        else {
            user[0].otp = otp;
        }
        await user.save();
        
        // create a user with phone number from req.body
        
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
router.post('/verifyotp', async (req, res) => { 
    try {
        var user = await User.find({ phone: req.body.phone });
        if (user.length == 0) {
            throw "User not found";
        }
        if (user[0].otp == req.body.otp) {
            res.statusCode = 200;
            user[0].otp = "";
            await user[0].save();
            res.send({
                message: "OTP verified",
                body: user
            });
        }
        else {
            res.statusCode = 400;
            res.send({
                message: "OTP not verified",
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
        var user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        });
        if (req.body.phone != "NA") {
            user.phone = req.body.phone;
        }
        else if (req.body.email != "NA") {
            user.email = req.body.email;
        }
        
        
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
    try {
        var user = await User.findById(req.params.userId).populate({
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
        var user = await User.findById(req.params.userId).populate({
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

// get enrollmentTokens of a user
router.get('/:userId/enrollmentToken', async (req, res) => {
    var flag = 0;
    var policyId = "", deviceId = "";
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
router.put('/:userId/devices/:deviceId', async (req, res) => {
    try {
        var device = await Device.findById(req.params.deviceId);
        device.nickname = req.body.nickname;
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
router.put('/:userId/devices/:deviceId/policy/:policyId', async (req, res) => { 
    try {
        var policy = Policy.findById(req.params.policyId);
        policy.adjustVolumeDisabled = req.body.adjustVolumeDisabled??policy.adjustVolumeDisabled;
        policy.installAppsDisabled = req.body.installAppsDisabled ?? policy.installAppsDisabled;
        policy.mountPhysicalMediaDisabled = req.body.mountPhysicalMediaDisabled ?? policy.mountPhysicalMediaDisabled;
        policy.outgoingCallsDisabled = req.body.outgoingCallsDisabled ?? policy.outgoingCallsDisabled;
        policy.usbFileTransferDisabled = req.body.usbFileTransferDisabled ?? policy.usbFileTransferDisabled;
        policy.bluetoothDisabled = req.body.bluetoothDisabled ?? policy.bluetoothDisabled;
        policy.playStoreMode = req.body.playStoreMode ?? policy.playStoreMode;
        policy.applications = req.body.applications ?? policy.applications;
        policy.locationMode = req.body.locationMode ?? policy.locationMode;
        policy.advancedSecurityOverrides = req.body.advancedSecurityOverrides ?? policy;
        var result = await ama.updatePolicy(req.body);
        if (result == false) {
            throw "Error in updating policy";
        }
        await policy.save();
        res.statusCode = 200;
        res.send({
            message: "Policy updated successfully",
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


async function createEnrollmentToken(userId) {
    var flag = 0;
    var policyId = "", deviceId = "";
    try {
        // check if tokenCount of user is greater than 0
        var user = await User.findById(req.params.userId);
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
    var userId = req.body.userId
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
        await User.updateOne({ _id: req.params.userId }, { $inc: { tokenCount: -1 } });
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
            await User.updateOne({ _id: req.params.userId }, { $pull: { devices: deviceId } });
            

        }
            
        console.log(e);
        throw e;
    }
}





module.exports = router;