const express = require('express');
const router = express.Router();
const ama = require('./utils/ama');

// import models from model.js
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

// get image
router.get('/image/:image', async (req, res) => {
	console.log('Getting image');
	try {
		const image = await Image.findOne({ name: req.params.image });
		res.statusCode = 200;
		res.send(image.image);
	} catch (e) {
		console.log(e);
		res.statusCode = 400;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

// upload image
router.post('/image/:image', async (req, res) => {
	console.log('Uploading image');
	if (!req.files.file) {
		return res.status(400).send('No image data found');
	}

	try {
		const file = req.files.file;

		// Do something with the file
		console.log(file.name);
		console.log(file.data);
		console.log(req.params.image);

		const imageSize = Buffer.byteLength(file.data, 'utf8');
		console.log(`Image size: ${imageSize} bytes`);

		// upload image to database with image._id = req.params.image
		const image = await Image.findOne({ name: req.params.image });
		// console.log(image)
		if (image) {
			await Image.updateOne(
				{ name: req.params.image },
				{
					image: file.data,
				}
			);
		} else {
			var i = new Image({
				name: req.params.image,
				image: file.data,
			});
			await i.save();
		}
		res.statusCode = 200;
		res.send({
			message: 'Image uploaded successfully',
			body: file,
		});
	} catch (e) {
		console.log(e);
		res.statusCode = 400;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

// get otp
router.get('/:phone/otp', async (req, res) => {
	try {
		// generate 6 digit random otp
		// var otp = Math.floor(100000 + Math.random() * 900000);
		console.log('Getting OTP');
		console.log(req.params.phone);
		var otp = '123456';
		// check if user with this phone number exists
		var user = await User.findOne({ phone: req.params.phone });
		if (!user) {
			var user = new User({
				phone: req.params.phone,
				otp: otp,
				otpExpires: Date.now() + 300000,
				otpTimestamp: Date.now(),
			});
		} else {
			if (Date.now() - user.otpTimestamp > 90000) {
				user.otp = otp;
				user.otpExpires = Date.now() + 300000;
				user.otpTimestamp = Date.now();
			} else {
				res.statusCode = 400;
				res.send({
					message: 'OTP already sent',
					body: null,
				});
				return;
			}
		}
		await user.save();

		res.statusCode = 200;
		res.send({
			message: 'OTP sent to ' + req.params.phone,
		});
	} catch (e) {
		console.log(e);
		res.statusCode = 500;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

// verify otp
router.post('/:phone/otp', async (req, res) => {
	try {
		console.log('Verifying OTP');
		console.log(req.body);
		var user = await User.findOne({ phone: req.params.phone });
		if (!user) {
			throw 'User not found';
		}
		if (user.otp == req.body.otp) {
			if (Date.now() - user.otpExpires > 300000) {
				res.statusCode = 400;
				res.send({
					message: 'OTP expired',
					body: null,
				});
				return;
			}
			if (!user.firstName) res.statusCode = 201;
			else res.statusCode = 200;
			res.send({
				message: 'OTP verified',
				body: user,
			});
		} else {
			res.statusCode = 400;
			res.send({
				message: 'Wrong OTP',
				body: null,
			});
		}
	} catch (e) {
		console.log(e);
		res.statusCode = 500;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

// put request to update user with userId in params
router.put('/:userId', async (req, res) => {
	try {
		var user = await User.findById(req.params.userId);
		if (!user) {
			throw 'User not found';
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
			message: 'User updated',
			body: user,
		});
	} catch (err) {
		console.log(err);
		if (e.code == 11000) {
			console.log('User already exists');

			user = JSON.parse(JSON.stringify(user));

			res.statusCode = 401;
			res.send({
				message: 'Email or Phone already linked to existing account',
			});
			return;
		}
		res.statusCode = 400;
		res.send({
			message: err,
			body: err,
		});
	}
});

//

// get user
router.post('/userexists', async (req, res) => {
	try {
		//check if user exists by using either phone or email
		var user;
		if (req.body.phone != 'NA') {
			user = await User.find({ phone: req.body.phone });
		} else if (req.body.email != 'NA') {
			user = await User.find({ email: req.body.email });
		}
		if (user.length != 0) {
			console.log(user);
			res.statusCode = 200;
			res.send({
				message: 'User found',
				body: user,
			});
			return;
		} else {
			res.statusCode = 200;
			res.send({
				message: 'User not found',
				body: null,
			});
			return;
		}
	} catch (e) {
		console.log(e);
		res.statusCode = 500;
		res.send({
			message: 'Internal server error',
			body: null,
		});
	}
});

// create user
router.post('/login', async (req, res) => {
	try {
		// create a new User
		console.log(req.body);
		// check if request body contains either phone or email
		if (req.body.phone == 'NA' && req.body.email == 'NA') {
			console.log('Nothing found');
			res.statusCode = 400;
			res.send({
				message: 'Phone or email required',
				body: null,
			});
			return;
		}
		// check if request body contains both phone and email
		if (req.body.email != 'NA') {
			console.log('Email found');
			console.log('Email is ' + req.body.email);
			var user = new User({
				firstName: req.body.firstName,
				lastName: req.body.lastName,
			});
			user.email = req.body.email;
			await user.save();
		} else if (req.body.phone != 'NA') {
			console.log('Phone found');
			console.log('Phone is ' + req.body.phone);
			var user = await User.findOne({ phone: req.body.phone });
			if (!user) {
				throw 'User not found';
			}
			user.firstName = req.body.firstName;
			user.lastName = req.body.lastName;
			await user.save();
		}

		// save user
		res.statusCode = 200;
		res.send({
			message: 'User created successfully',
			body: user,
		});
	} catch (e) {
		console.log(e.keyValue);
		console.log(e);
		// if user already exists
		if (e.code == 11000) {
			console.log('User already exists');
			var user;
			// if e.keyValue.phone exists
			if (e.keyValue.phone) {
				user = await User.findOne({ phone: req.body.phone });
			} else {
				user = await User.findOne({ email: req.body.email });
			}

			console.log(user);
			res.statusCode = 200;
			// convert user to json format

			user = JSON.parse(JSON.stringify(user));

			res.statusCode = 200;
			res.send({
				message: 'User already exists',
				body: user,
			});
			return;
		}
		console.log(e);
		res.statusCode = 400;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

router.delete('/:userId', async (req, res) => {
	// delete user
	try {
		var user = await User.deleteOne({ _id: req.params.userId });
		console.log(user);
		res.statusCode = 200;
		res.send({
			message: 'User deleted successfully',
			body: user,
		});
	} catch (e) {
		console.log(e);
		res.statusCode = 400;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

// get devices of a user
router.get('/:userId/device', async (req, res) => {
	// get user and populate devices
	console.log('Getting devices for user' + req.params.userId);
	try {
		var user = await User.findById(req.params.userId).populate({
			path: 'devices',
			populate: {
				path: 'policy',
				model: 'Policy',
			},
		});
		console.log(user.devices);
		res.statusCode = 200;
		res.send({
			message: 'Devices found',
			body: user.devices,
			devices: user.devices,
		});
	} catch (e) {
		console.log(e);
		res.statusCode = 400;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

// get a particular device of a user
router.get('/:userId/device/:deviceId', async (req, res) => {
	// get user and populate devices
	try {
		var device = await Device.findById(req.params.deviceId).populate({
			path: 'policy',
			model: 'Policy',
			// match: { _id: req.params.deviceId },
			// populate: {
			//     path: 'policy',
			//     model: 'Policy'
			// }
		});
		console.log(device);
		res.statusCode = 200;
		res.send({
			message: 'Device found',
			body: device,
		});
	} catch (e) {
		console.log(e);
		res.statusCode = 400;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

// get enrollmentTokens of a user
router.get('/:userId/enrollmentToken', async (req, res) => {
	try {
		// check if tokenCount of user is greater than 0
		var user = await User.findById(req.params.userId).populate({
			path: 'orders',
			model: 'Orders',
		});
		if (user.tokenCount == 0) {
			res.status(200).send({
				message: 'There are no pending orders',
			});
			return;
		}
		var tokenCount = user.tokenCount;
		for (var index = 0; index < user.orders.length; index++) {
			if (tokenCount > 0) {
				await createEnrollmentToken(req.params.userId, order._id);
				tokenCount = max(tokenCount - order.tokenCount, 0);
			} else {
				break;
			}
		}

		res.statusCode = 200;
		res.send({
			message: 'Enrollment tokens created successfully',
		});
	} catch (e) {
		console.log(e);
		res.statusCode = 500;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

// UPDATE DEVICE put request taking in userId and deviceId as params to update device
router.put('/:userId/device/:deviceId', async (req, res) => {
	try {
		var device = await Device.findById(req.params.deviceId);
		device.nickname = req.body.nickname;
		device.apps = req.body.apps;
		await device.save();
		res.statusCode = 200;
		res.send({
			message: 'Device updated successfully',
			body: device,
		});
	} catch (e) {
		res.statusCode = 400;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

// UPDATE POLICY put request taking in userId, deviceId and policyId as params to update policy
router.put('/:userId/device/:deviceId/policy/:policyId', async (req, res) => {
	try {
		var policy = await Policy.findById(req.params.policyId);
		policy.adjustVolumeDisabled =
			req.body.policyItself.adjustVolumeDisabled ??
			policy.adjustVolumeDisabled;
		policy.installAppsDisabled =
			req.body.policyItself.installAppsDisabled ??
			policy.installAppsDisabled;
		policy.mountPhysicalMediaDisabled =
			req.body.policyItself.mountPhysicalMediaDisabled ??
			policy.mountPhysicalMediaDisabled;
		policy.outgoingCallsDisabled =
			req.body.policyItself.outgoingCallsDisabled ??
			policy.outgoingCallsDisabled;
		policy.usbFileTransferDisabled =
			req.body.policyItself.usbFileTransferDisabled ??
			policy.usbFileTransferDisabled;
		policy.bluetoothDisabled =
			req.body.policyItself.bluetoothDisabled ?? policy.bluetoothDisabled;
		policy.playStoreMode =
			req.body.policyItself.playStoreMode ?? policy.playStoreMode;
		policy.applications =
			req.body.policyItself.applications ?? policy.applications;
		// policy.locationMode = req.body.policyItself.locationMode ?? policy.locationMode;
		policy.advancedSecurityOverrides =
			req.body.policyItself.advancedSecurityOverrides ??
			policy.advancedSecurityOverrides;
		console.log('Mongodb');
		console.log(policy);
		delete req.body.policyItself._id;
		// delete req.body.policyItself.applications;
		delete req.body.policyItself.__v;
		// delete req.body.policyItself.advancedSecurityOverrides;

		console.log(req.body.policyItself);
		var result = await ama.updatePolicy({
			policyItself: req.body.policyItself,
		});
		if (result == false) {
			throw 'Error in updating policy';
		}
		await policy.save();
		res.statusCode = 200;
		res.send({
			message: 'Policy updated successfully',
			body: policy,
		});
	} catch (e) {
		console.log(e);
		res.statusCode = 400;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

// Fetch all offers
router.get('/offers', async (req, res) => {
	try {
		const allOffers = await Offer.find();
		res.json(allOffers);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});


// create an order
router.post('/:userId/offers/:offerId', async (req, res) => {
	try {
		const offer = await Offer.findById(req.params.offerId);
		if (!offer) {
			return res.status(404).json({ error: 'Offer not found' });
		}

		var user = await User.findById(req.params.userId);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const currentDateAndTime = new Date();
		const formattedDateAndTime = new Intl.DateTimeFormat(
			'en-IN',
			options
		).format(currentDateAndTime);
		const fifteenMinutesLater = new Date(currentDateAndTime);
		fifteenMinutesLater.setMinutes(currentDateAndTime.getMinutes() + 15);

		var order = new Order({
			user: req.params.userId,
			orderPlacingDate: formattedDateAndTime,
			orderExpiryDate: fifteenMinutesLater,
			offer: offer,
			discountedPrice: offer.discountedPrice,
			orderStatus: 'Payment in process',
			orderDescription: 'Proceeding to the payment page',
			paymentStatus: 'Pending',
			orderType: 'New',
		});
		var savedOrder = await order.save();

		user.orders.push(savedOrder._id);
		await user.save();

		res.status(201).json(savedOrder);
	} catch (e) {
		res.statusCode = 500;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

async function createEnrollmentToken(userId, orderId) {
	console.log('Creating enrollment tokens');
	var flag = 0;
	var policyId = '',
		deviceId = '';
	try {
		var user = await User.findById(userId);
		// TODO Optimization by passing orderItself rather than id
		const order = await Order.findById(orderId);
		var tokenCount = user.tokenCount;
		if (tokenCount <= 0) {
			throw 'User has no tokens left';
		}

		for (var index = 0; index < tokenCount; index++) {
			// TODO Change policy accordingly
			var policy = new Policy({
				applications: [],
				adjustVolumeDisabled: false,
				installAppsDisabled: false,
				factoryResetDisabled: true,
				mountPhysicalMediaDisabled: false,
				outgoingCallsDisabled: false,
				usbFileTransferDisabled: false,
				bluetoothDisabled: false,
				playStoreMode: 'BLACKLIST',
				advancedSecurityOverrides: {
					untrustedAppsPolicy: 'DISALLOW_INSTALL',
					developerSettings: 'DEVELOPER_SETTINGS_DISABLED',
				},
			});
			await policy.save();
			var res1 = await ama.createPolicy(policy._id);
			if (res1 == false) {
				throw 'Error in creating policy';
			}
			policy.name = ama.policyPrefix + policy._id;
			await policy.save();
			flag = 1;
			policyId = policy._id;
			var numberOfDevices = user.devices.length;
			var device = new Device({
				nickname: 'Device ' + (numberOfDevices + 1),
				createdOn: order.paymentCompleteDate,
				renewalDate: order.orderExpiryDate,
				currentlyEnrolled: false,
				policy: policy._id,
				// TODO description and status of yet to be enrolled
				otp: Math.floor(100000 + Math.random() * 900000),
			});
			await device.save();
			user.devices.push(device._id);
			await user.save();
			flag = 2;
			deviceId = device._id;
			let r = await ama.getEnrollmentToken(policy._id);
			console.log(r);
			device.qrCode = r;
			device.save();
			if (r == null) {
				throw 'Error in generating enrollment token';
			} else {
				await User.updateOne(
					{ _id: userId },
					{
						$inc: { tokenCount: -1 },
					}
				);
			}
		}
	} catch (e) {
		if (flag >= 1) {
			// delete the created policy using policyId
			await Policy.deleteOne({ _id: policyId });
		}
		if (flag == 2) {
			// delete the created device using deviceId and pop it out of the user's devices array using deviceId
			await Device.deleteOne({ _id: deviceId });
			await User.updateOne(
				{ _id: userId },
				{ $pull: { devices: deviceId } }
			);
		}

		console.log(e);
		throw e;
	}
}

module.exports = {
	userRoute: router,
	createEnrollmentToken: createEnrollmentToken,
};
