const express = require('express');
const fs = require('fs');
const router = express.Router();


// const KEY_ID = 'rzp_test_VboEg3JlSSSWFW',
// 	KEY_SECRET = '1CYTNm023YmuB0WnBlDpKnGJ';


// get keys from rzp-key.json
const keys = JSON.parse(fs.readFileSync('./keys/rzp-key.json', 'utf-8'));
const KEY_ID = keys.KEY_ID;
const KEY_SECRET = keys.KEY_SECRET;

const {
	Value,
	Image,
	User,
	Device,
	Policy,
	Offer,
	Order,
} = require('./utils/model');

const options = {
	timeZone: 'Asia/Kolkata', // Indian Standard Time (IST)
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hour12: false,
};

router.post('/offers', async (req, res) => {
	try {
		const newOffer = new Offer(req.body);
		await newOffer.save();
		res.status(201).json(newOffer);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Update an offer by ID
router.put('/offers/:id', async (req, res) => {
	try {
		const updatedOffer = await Offer.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true, // Return the updated document
			}
		);
		if (!updatedOffer) {
			return res.status(404).json({ error: 'Offer not found' });
		}
		res.json(updatedOffer);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Delete an offer by ID
router.delete('/offers/:id', async (req, res) => {
	try {
		const deletedOffer = await Offer.findByIdAndDelete(req.params.id);
		if (!deletedOffer) {
			return res.status(404).json({ error: 'Offer not found' });
		}
		res.json(deletedOffer);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Fetch all offers
router.get('/offers', async (req, res) => {
	try {
		const allOffers = await Offer.find();
		res.status(200).send({
			message: 'Offers received',
			body: allOffers,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Payment completed
router.post('/payment', async (req, res) => {
	try {
		const orderId = req.body.orderId;
		var order = await Order.findById(orderId).populate({
			path: 'offer',
			model: 'Offer',
		});
		const tenureString = order.offer.tenure;
		const [year, month, day] = tenureString.split('/').map(Number);

		const currentDateAndTime = new Date();
		const formattedDateAndTime = new Intl.DateTimeFormat(
			'en-IN',
			options
		).format(currentDateAndTime);

		const orderEndingDate = new Date(currentDateAndTime);
		orderEndingDate.setFullYear(currentDateAndTime.getFullYear() + year);
		orderEndingDate.setMonth(currentDateAndTime.getMonth() + month);
		orderEndingDate.setDate(currentDateAndTime.getDate() + day + 1);
		orderEndingDate.setHours(0, 0, 0, 0);

		order.paymentCompletedDate = currentDateAndTime;
		order.orderEndingDate = orderEndingDate;
		order.orderStatus = 'Active';
		order.orderDescription = 'Order is Active';
		order.paymentStatus = 'Paid';
		await order.save();
		await User.updateOne(
			{ _id: order.user },
			{ $inc: { tokenCount: order.offer.tokenCount } }
		);

		res.status(200).send();
	} catch (e) {
		res.status(500).json({ error: 'Internal Server Error' });
	}
});





module.exports = router;
