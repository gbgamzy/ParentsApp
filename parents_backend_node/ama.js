
var url = "https://www.emigaps.co.in/api/intro/";

const http = require("http");
const axios = require("axios");

const policyPrefix = "enterprises/LC03rv38l8/policies/"

var options = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        
    }
};

var defaultPolicy = {
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
    },
    locationMode: "LOCATION_USER_CHOICE"
}


async function getEnrollmentToken(name) {
    name = policyPrefix + name;
    var policyItself = defaultPolicy;
    policyItself['name'] = name;
    var requestBody = JSON.stringify({
        "policyItself": policyItself
    });
    try {
        var r = null;
        await axios.post(url + 'getEnrollmentToken1/', requestBody, options)
            .then((res) => {
                console.log(res.data.body['token']['qrCode']);
            if (res.status == 200){
                r = res.data.body['token']['qrCode'];
            }
            else {
                console.log(res.data);
            }
            
            });
        return r;
    }
    catch (e) {
        console.log(e);

    }
        


}

async function createPolicy(name) {
    name = policyPrefix + name;
    var policyItself = defaultPolicy;
    policyItself['name'] = name;
    var requestBody = JSON.stringify({
        "policyItself": policyItself
    });
    try {
        await axios.put(url + 'updatePolicy1/', requestBody, options)
        .then((res) => {
            if (res.status == 200){
                return true;
            }
            else {
                console.log(res.data);
                return false;
            }
            
        });
    }
    catch (e) {
        console.log(e);

    }
}

async function updatePolicy(policy) {
    var options1 = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            
        }
    };

    var requestBody = JSON.stringify({
        "policyItself": policy
    });
    console.log("Request body")
    console.log(requestBody);

    try {
        await axios.put(url + 'updatePolicy1/', requestBody, options1)
            .then((res) => {
                console.log(res.data);
            if (res.status == 200){
                return true;
            }
            else {
                // console.log(res.data);
                return false;
            }
            
        });
    }
    catch (e) {
        console.log("Error from axios");
        console.log(e)
        return false;
    }
}


module.exports = {
    getEnrollmentToken: getEnrollmentToken,
    createPolicy: createPolicy,
    updatePolicy: updatePolicy,
    policyPrefix: policyPrefix
}