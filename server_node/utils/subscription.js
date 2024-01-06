var http = require('http');
var express = require('express');
var events = require('events');
var axios = require('axios');

const { policyPrefix } = require('./ama');

const { Value, Image, User, Device, Policy } = require('./model');


const subscriptionId = 'projects/emisafe/subscriptions/DeviceEnrolledSubscription';
const subscriptionName = 'EMIGAPS_SUBSCRIPTION';
const timeout = 100n * 365n * 24n * 60n * 60n * 1000n; // 100    years in milliseconds


// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');

// Creates a client; cache this for further use
const pubSubClient = new PubSub({
    projectId: "emisafe",
    keyFilename: "./server_node/utils/key.json"
});
// an async function to create a topic

async function listenForMessages(subscriptionNameOrId) {
    // References an existing subscription
    console.log("Listening for messages on subscription: ", subscriptionNameOrId);
    const subscription = pubSubClient.subscription(subscriptionNameOrId);

    // Create an event handler to handle messages
    let messageCount = 0;
    const messageHandler = async (message) => {
        const data = JSON.parse(message.data.toString());
        console.log(message.attributes);
        console.log(message.data.toString());
          // console.log(data);


        try {
            if (message.attributes['notificationType'] === 'ENROLLMENT' && data['state'] === 'PROVISIONING') {
                try {
                    const policyId = getRemainingPart(data['policyName'], policyPrefix);
                    await Device.updateOne({ policy: policyId }, {
                        name: data['name'],
                        brand: data['hardwareInfo']['brand'],
                        model: data['hardwareInfo']['model']
                    });
                    console.log(res);
                } catch (error) {
                    console.log(error);
                }

            }
            message.ack();
        }
        catch (e) {
            console.log(e);
        }


    };

    // Listen for new messages until timeout is hit
    subscription.on('message', messageHandler);
    subscription.on('error', (error) => {
        console.error(error);
    });
    subscription.on('listening', () => {
        console.log("Listening for messages on subscription: ", subscriptionNameOrId);
    });

  // Wait a while for the subscription to run. (Part of the sample only.)
    // setTimeout(() => {
    //     subscription.removeListener('message', messageHandler);
    //     console.log(`${messageCount} message(s) received.`);
    // }, timeout);
}


function getRemainingPart(S, b) {
  // Check if b is a prefix of S
    if (S.startsWith(b)) {
    // Get the remaining part after removing b
        const remainingPart = S.substring(b.length);
        return remainingPart;
    } else {
    // If b is not a prefix, return an appropriate value or handle the error
    throw 'Substring b is not a prefix of S.';
    }
}


module.exports = {
    listenForEnrollments: listenForMessages
}
