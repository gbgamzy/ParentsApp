const express = require('express');
const router = express.Router();
const ama = require('./utils/ama');
const fileUpload = require('express-fileupload');



const app = express();

// Middleware configuration
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } })); // 50MB limit

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

// import functions from rzp.js
const { createOrder } = require('./utils/rzp');

const teencarejrApp = {
	packageName: 'com.gaps.teencarejr',
	installType: 'REQUIRED_FOR_SETUP',
	defaultPermissionPolicy: 'GRANT',
	permissionGrants: [],
	managedConfiguration: {},
	disabled: 'False',
	minimumVersionCode: 1,
	delegatedScopes: ['PACKAGE_ACCESS'],
	autoUpdateMode: 'AUTO_UPDATE_HIGH_PRIORITY',
	extensionConfig: {},
};

// import functions from sms.js
const SMS = require('./utils/sms');
const { generateRandomWord, redeemRandomWord } = require('./utils/utils');

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
		res.statusCode = 500;
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
		return res.status(500).send('No image data found');
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
		res.statusCode = 500;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

// get otp
router.get('/:phone/otp', async (req, res) => {
	try {
		console.log('Getting OTP');
		// if phone is not 10 digits
		if (req.params.phone.length != 10) {
			res.statusCode = 500;
			res.send({
				message: 'Phone number is not valid',
				body: null,
			});
			return;
		}

		// check if user with this phone number exists
		User.findOne({ phone: req.params.phone }).then(async (user) => {
			if (!user) {
				var user = new User({
					phone: req.params.phone,
				});
				await user.save();
			}
		});
		SMS.sendOtp(req.params.phone).then((result) => {
			res.statusCode = result.statusCode;
			res.send({
				message: result.message,
			});
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

		var user = await User.findOne({ phone: req.params.phone });
		if (!user) {
			throw 'User not found';
		}
		SMS.verifyOtp(req.params.phone, req.body.otp).then((result) => {
			res.statusCode = result.statusCode;
			res.send({
				message: result.message,
				body: user,
			});
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

			res.statusCode = 500;
			res.send({
				message: 'Email or Phone already linked to existing account',
			});
			return;
		}
		res.statusCode = 500;
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
			res.statusCode = 500;
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
		res.statusCode = 500;
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
		res.statusCode = 500;
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

		res.statusCode = 200;
		res.send({
			message: 'Devices found',
			body: user.devices,
			devices: user.devices,
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
		res.statusCode = 500;
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
		res.statusCode = 500;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

// UPDATE POLICY put request taking in userId, deviceId and policyId as params to update policy
router.put('/:userId/device/:deviceId/policy/:policyId', async (req, res) => {
	try {
		console.log("Updating policy for ${req.params.policyId}");
		var policy = await Policy.findById(req.params.policyId);
		if (!policy) {
            throw new Error('Policy not found');
        }

		// policy.adjustVolumeDisabled =
		// 	req.body.policyItself.adjustVolumeDisabled ??
		// 	policy.adjustVolumeDisabled;
		// policy.installAppsDisabled =
		// 	req.body.policyItself.installAppsDisabled ??
		// 	policy.installAppsDisabled;
		// policy.mountPhysicalMediaDisabled =
		// 	req.body.policyItself.mountPhysicalMediaDisabled ??
		// 	policy.mountPhysicalMediaDisabled;
		// policy.outgoingCallsDisabled =
		// 	req.body.policyItself.outgoingCallsDisabled ??
		// 	policy.outgoingCallsDisabled;
		// policy.usbFileTransferDisabled =
		// 	req.body.policyItself.usbFileTransferDisabled ??
		// 	policy.usbFileTransferDisabled;
		// policy.bluetoothDisabled =
		// 	req.body.policyItself.bluetoothDisabled ?? policy.bluetoothDisabled;
		// policy.playStoreMode =
		// 	req.body.policyItself.playStoreMode ?? policy.playStoreMode;
		// policy.applications =
		// 	req.body.policyItself.applications ?? policy.applications;
		// // policy.locationMode = req.body.policyItself.locationMode ?? policy.locationMode;
		// policy.advancedSecurityOverrides =
		// 	req.body.policyItself.advancedSecurityOverrides ??
		// 	policy.advancedSecurityOverrides;
		console.log(policy);
		console.log(req.body.policyItself);
		updatePolicyFields(policy, req.body.policyItself);
        const updatedPolicyItself = { ...req.body.policyItself };
		updatePolicyFields(updatedPolicyItself, req.body.policyItself);
		console.log('Final policy to update:', policy);
        console.log('Updated policyItself to send to AMA:', updatedPolicyItself);
		delete req.body.policyItself._id;
		// delete req.body.policyItself.applications;
		delete req.body.policyItself.__v;
		// delete req.body.policyItself.advancedSecurityOverrides;

		console.log(req.body.policyItself);
		var result = await ama.updatePolicy({
			policyItself: updatedPolicyItself,
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
		res.statusCode = 500;
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
		res.status(200).send({
			message: 'Offers received',
			body: allOffers,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// create an order
router.post('/:userId/offers/:offerId', async (req, res) => {
	var orderId;
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
		// const formattedDateAndTime = new Intl.DateTimeFormat(
		// 	'en-IN',
		// 	options
		// ).format(currentDateAndTime);
		const fifteenMinutesLater = new Date(currentDateAndTime);
		fifteenMinutesLater.setMinutes(currentDateAndTime.getMinutes() + 15);
		var result = await createOrder(
			offer.discountedPrice * 100,
			'INR',
			offer.name
		);
		if (result.statusCode != 200) {
			throw 'Error in creating order';
		}
		orderId = result.body;

		var order = new Order({
			user: req.params.userId,
			orderId: result.body,
			orderPlacingDate: currentDateAndTime,
			orderExpiryDate: fifteenMinutesLater,
			offer: offer,
			discountedPrice: offer.discountedPrice,
			orderStatus: 'Payment in process',
			orderDescription: 'Proceeding to the payment page',
			paymentStatus: 'Pending',
			orderType: 'New',
			tokenCount: offer.tokenCount,
		});
		var savedOrder = await order.save();

		user.orders.push(savedOrder._id);
		await user.save();
		console.log(
			'Order ' +
				order._id +
				' placed by user ' +
				req.params.userId +
				' for ' +
				offer.tokenCount +
				' devices'
		);
		res.status(201).send({
			message: 'Order placed',
			body: savedOrder,
		});
	} catch (e) {
		res.statusCode = 500;
		res.send({
			message: 'Internal server error',
			body: e,
		});
	}
});

// get orders of a user from its userId in params
router.get('/:userId/orders', async (req, res) => {
	try {
		var user = await User.findById(req.params.userId).populate({
			path: 'orders',
			model: 'Order',
		});
		res.status(200).send({
			message: 'Orders received',
			body: user,
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

// post request to link a device
router.post('/link', async (req, res) => {
	try {
		var deviceId = req.body.deviceId;
		var otp = req.body.otp;
		var device = await Device.findById({ otp: otp });
		if (!device) {
			throw 'Device not found';
		}
		device.deviceId = deviceId;
		device.otp = '';
		redeemRandomWord(otp);
		await device.save();
		res.statusCode = 200;
		res.send({
			message: 'Device linked successfully',
			body: device,
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

router.post('/log/location', async (req, res) => {
	try {
		var deviceId = req.body.deviceId;
		var latitude = req.body.latitude;
		var longitude = req.body.longitude;
		var timestamp = req.body.timestamp;
		res.statusCode = 200;
		res.send({
			message: 'Location recorded',
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

function updatePolicyFields(policy, updates) {
    const fields = [
        'adjustVolumeDisabled',
        'installAppsDisabled',
        'mountPhysicalMediaDisabled',
        'outgoingCallsDisabled',
        'usbFileTransferDisabled',
        'bluetoothDisabled',
        'playStoreMode',
        'applications',
        'advancedSecurityOverrides'
    ];

    fields.forEach(field => {
        if (updates[field] !== undefined) {
            policy[field] = updates[field];
        }
    });
}


async function createEnrollmentToken(payload) {
	console.log('Creating enrollment tokens');
	var flag = 0;
	var policyId = '',
		deviceId = '';
	var userId = '';
	try {
		const orderId = payload.payment.entity.order_id;
		const paymentMethod = payload.payment.entity.method;
		const paymentId = payload.payment.entity.id;
		const currentDateAndTime = new Date();

		var order = await Order.findOne({ orderId: orderId });
		console.log(order);
		if (order.paymentId && order.paymentId.toString().length > 5) {
			throw 'Order already paid';
		}

		var user = await User.findById(order.user);

		user.tokenCount = user.tokenCount + order.tokenCount;
		console.log(user);
		await user.save();
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
				// TODO description and status of yet to be enrolled,
				apps: [
					{
						packageName: 'default',
						name: 'default',
						imageLink: 'default',
					},
				],
				orders: [order._id],
				otp: generateRandomWord(8),
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
			userId = user._id;
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
		order.paymentMethod = paymentMethod;
		order.paymentId = paymentId;
		order.paymentCompleteDate = currentDateAndTime;
		order.orderStatus = 'Payment complete';
		order.orderDescription =
			'Payment complete, your tokens will be visible in a few minutes';
		order.paymentStatus = 'Paid';
		await order.save();
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
	}
}

module.exports = {
	userRoute: router,
	createEnrollmentToken: createEnrollmentToken,
};
