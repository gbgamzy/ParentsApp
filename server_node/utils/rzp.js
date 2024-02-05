const Razorpay = require('razorpay');
const express = require('express');
const fs = require('fs');
const router = express.Router();
const crypto = require('crypto');
const bodyParser = require('body-parser');

const keys = JSON.parse(fs.readFileSync('./keys/rzp-key.json', 'utf-8'));
const KEY_ID = keys['key_id'];
const KEY_SECRET = keys['key_secret'];
const razorpaySecret = 'vZ3evP7Ltyc@RVS';

var instance = new Razorpay({
	key_id: KEY_ID,
	key_secret: KEY_SECRET,
});

// async function to create order
async function createOrder(amount, currency, receipt) {
	try {
		const response = await instance.orders.create({
			amount,
			currency,
			receipt,
		});
		if (response.status === 'created') {
			return {
				statusCode: 200,
				message: 'Order created successfully',
				body: response.id,
			};
		}
		return {
			statusCode: 500,
			message: 'Internal Server Error',
			body: response,
		};
	} catch (error) {
		console.log(error);
		return {
			statusCode: 500,
			message: 'Internal Server Error',
			body: error,
		};
	}
}

router.post('/webhook', (req, res) => {
	const body = JSON.stringify(req.body);
	const signature = req.get('x-razorpay-signature');

	const expectedSignature = crypto
		.createHmac('sha256', razorpaySecret)
		.update(body)
		.digest('hex');

	if (signature === expectedSignature) {
		// Webhook verification successful
		console.log('Webhook verified successfully');
		// Handle the webhook event as needed
		handleWebhookEvent(req.body);
		res.status(200).send('Webhook received successfully');
	} else {
		// Webhook verification failed
		console.error('Webhook verification failed');
		res.status(400).send('Webhook verification failed');
	}
});

function handleWebhookEvent(event) {
    console.log('Webhook event received:', event);
    console.log(event.payload)
}

// export the function
module.exports = {
    createOrder: createOrder,
    rzpRoute: router
};
