const Razorpay = require('razorpay');
const express = require('express');
const fs = require('fs');
const router = express.Router();
const crypto = require('crypto');
const bodyParser = require('body-parser');
const { createEnrollmentToken } = require('./user');

const live_mode = false;

const keys = JSON.parse(fs.readFileSync('./keys/rzp-key.json', 'utf-8'));
var KEY_ID, KEY_SECRET;
if (live_mode) {
	KEY_ID = keys['key_id_live'];
	KEY_SECRET = keys['key_secret_live'];
} else {
	KEY_ID = keys['key_id'];
	KEY_SECRET = keys['key_secret'];
}
const razorpaySecret = keys['secret'];

var instance = new Razorpay({
	key_id: KEY_ID,
	key_secret: KEY_SECRET,
});

var orderPipeline = new Set();

router.post('/webhook', (req, res) => {
	const body = JSON.stringify(req.body);
	const signature = req.get('x-razorpay-signature');

	const expectedSignature = crypto
		.createHmac('sha256', razorpaySecret)
		.update(body)
		.digest('hex');

	if (signature === expectedSignature) {
		// Webhook verification successful
		// Handle the webhook event as needed
		handleWebhookEvent(req.body);
		res.status(200).send('Webhook received successfully');
	} else {
		// Webhook verification failed
		console.error('Webhook verification failed');
		res.status(400).send('Webhook verification failed');
	}
});

function checkIfOrderInProcessing(orderId) {
	if (orderPipeline.has(orderId)) {
		return 'ALREADY_PROCESSING';
	} else {
		orderPipeline.add(orderId);
		return 'IN_PROCESSING';
	}
}

// TODO: Make it a service
function orderProcessingComplete(orderId) {
	try {
		orderPipeline.delete(orderId);
	} catch (e) {
		console.log(e);
	}
}

function handleWebhookEvent(event) {
	var ifProcessing = '';
	try {
		switch (event.event) {
			case 'order.paid':
				ifProcessing = checkIfOrderInProcessing(
					event.payload.payment.entity.order_id
				);
				if (ifProcessing == 'IN_PROCESSING') {
					createEnrollmentToken(event.payload);
				}
				break;
			case 'payment.authorized':
				ifProcessing = checkIfOrderInProcessing(
					event.payload.payment.entity.order_id
				);
				if (ifProcessing == 'IN_PROCESSING') {
					createEnrollmentToken(event.payload);
				}
				break;
			case 'payment.captured':
				ifProcessing = checkIfOrderInProcessing(
					event.payload.payment.entity.order_id
				);
				if (ifProcessing == 'IN_PROCESSING') {
					createEnrollmentToken(event.payload);
				}
				break;
			case 'payment.failed':
				console.log('Payment failed');
				break;
			default:
				console.log('Unhandled event:', event.event);
		}
	} catch (e) {
		console.log(e);
	}
}

module.exports = {
	rzpRoute: router,
};
