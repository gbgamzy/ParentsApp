const mongoose = require('mongoose');



const ValueModel = mongoose.model('Value', new mongoose.Schema({
    key: {
        type: String,
    },
    numValue: {
        type: Number,
    },
    stringValue: {
        type: String,
    },
    listValue: [{
        type: String
    }]
}));

const UserModel = mongoose.model('User', new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    phone: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
    },
    tokenCount: {
        type: Number,
        default: 0
    },
    devices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device'
    }]
    
}));


const PolicyModel = mongoose.model('Policy', new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        index: true
    },
    applications: [{
        packageName: String,
        installType: String,
        disabled: Boolean,
    }],
    adjustVolumeDisabled: Boolean,
    factoryResetDisabled: Boolean,
    mountPhysicalMediaDisabled: Boolean,
    outgoingCallsDisabled: Boolean,
    usbFileTransferDisabled: Boolean,
    playStoreMode: String,
    advancedSecurityOverrides: {
        "untrustedAppsPolicy": String,
        "developerSettings": String
    },
    locationMode: String
}));

const DeviceModel = mongoose.model('Device', new mongoose.Schema({
    name: String,
    brand: String,
    model: String,
    nickname: String,
    policy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Policy'
    },
    createdOn: String,
    enrolledOn: String,
    currentlyEnrolled: Boolean,
    otp: String,
    qrCode: String,

}));








const ImageModel = mongoose.model('Image', new mongoose.Schema({
    image: {
        type: Buffer
    },
    
}));





module.exports = {
    User: UserModel,
    Device: DeviceModel,
    Policy: PolicyModel,
    Value: ValueModel,
    Image: ImageModel,
}   

