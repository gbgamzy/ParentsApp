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
    },
    lastName: {
        type: String,
    },
    phone: {
        type: String,
        unique: true,
        partialFilterExpression: {phone: {$exists: true}}
    },
    email: {
        type: String,
        unique: true,
        partialFilterExpression: { email: { $exists: true } }
        // explain what this does
        
    },
    tokenCount: {
        type: Number,
        default: 0
    },
    devices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device'
    }],
    image: String,
    otp: String,
    otpExpires: Date,
    otpTimestamp: Date,
    
}));


const PolicyModel = mongoose.model('Policy', new mongoose.Schema({
    name: {
        type: String,
    },
    applications: [{
        packageName: String,
        installType: String,
        // FORCE_INSTALLED
        // BLOCKED
        // KIOSK
        disabled: Boolean,
    }],
    adjustVolumeDisabled: Boolean,
    installAppsDisabled: Boolean,
    factoryResetDisabled: Boolean,
    mountPhysicalMediaDisabled: Boolean,
    outgoingCallsDisabled: Boolean,
    usbFileTransferDisabled: Boolean,
    bluetoothDisabled: Boolean,
    playStoreMode: String,
    // WHITELIST
    // BLACKLIST
    
    
    advancedSecurityOverrides: {
        "untrustedAppsPolicy": String,
        // DISALLOW_INSTALL
        // ALLOW_INSTALL_DEVICE_WIDE
        "developerSettings": String
        // DEVELOPER_SETTINGS_DISABLED
        // DEVELOPER_SETTINGS_ALLOWED
    },
    locationMode: String
    // LOCATION_ENFORCED
    // LOCATION_USER_CHOICE
    // LOCATION_DISABLED
}));

const DeviceModel = mongoose.model('Device', new mongoose.Schema({
    name: String,
    brand: String,
    model: String,
    nickname: String,
    qrCode: String,
    policy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Policy'
    },
    createdOn: String,
    enrolledOn: String,
    currentlyEnrolled: Boolean,
    otp: String,
    qrCode: String,
    image: String,
    apps: [{
        package: {
            type: String,
            unique: true
        },
        name: String,
        imageLink: String
    }]
}));








const ImageModel = mongoose.model('Image', new mongoose.Schema({
    name: {
        type: String,
        index: true,
        unique: true,
        required: true
    },
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

