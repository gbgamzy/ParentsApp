const mongoose = require('mongoose');
const moment = require('moment-timezone');


const ValueModel = mongoose.model(
	'Value',
	new mongoose.Schema({
		key: {
			type: String,
		},
		numValue: {
			type: Number,
		},
		stringValue: {
			type: String,
		},
		listValue: [
			{
				type: String,
			},
		],
	})
);

const UserModel = mongoose.model(
	'User',
	new mongoose.Schema({
		firstName: {
			type: String,
		},
		lastName: {
			type: String,
		},
		phone: {
			type: String,
			unique: true,
			sparse: true,
		},
		email: {
			type: String,
			unique: true,
			sparse: true,
		},
		tokenCount: {
			type: Number,
			default: 0,
		},
		devices: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Device',
			},
		],
		image: String,
		otp: String,
		otpExpires: Date,
		otpTimestamp: Date,
		orders: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Order',
			},
		],
	})
);

const PolicyModel = mongoose.model(
	'Policy',
	new mongoose.Schema({
		name: {
			type: String,
		},
		applications: [
			{
				packageName: String,
				installType: String,
				// FORCE_INSTALLED
				// BLOCKED
				// KIOSK
				disabled: Boolean,
			},
		],
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
			untrustedAppsPolicy: String,
			// DISALLOW_INSTALL
			// ALLOW_INSTALL_DEVICE_WIDE
			developerSettings: String,
			// DEVELOPER_SETTINGS_DISABLED
			// DEVELOPER_SETTINGS_ALLOWED
		},
		locationMode: String,
		// LOCATION_ENFORCED
		// LOCATION_USER_CHOICE
		// LOCATION_DISABLED
	})
);

const DeviceModel = mongoose.model(
	'Device',
	new mongoose.Schema({
		name: String,
		brand: String,
		model: String,
		nickname: String,
		qrCode: String,
		policy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Policy',
			unique: true,
		},
		orders: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Order',
			},
		],
		createdOn: Date,
		enrolledOn: Date,
		currentlyEnrolled: Boolean,
		otp: String,
		image: String,
		// TODO Renewal Date Added,
		devicesStatus: String,
		deviceDescription: String,
		renewalDate: Date,
		apps: [
			{
				package: {
					type: String,
					unique: true,
				},
				name: String,
				imageLink: String,
			},
		],
	})
);

const OfferModel = mongoose.model(
	'Offer',
	new mongoose.Schema({
		title: {
			type: String,
			required: true,
		},
		description: String,
		tokenCount: {
			type: Number,
			immutable: true,
			required: true,
		},
		tenure: {
			type: String,
			immutable: true,
			required: true,
		},
		originalPrice: {
			type: Number,
			immutable: true,
			required: true,
		},
		discountedPrice: {
			type: Number,
			required: true,
		},
		gst: {
			type: Number
		},
		image: String,
		benefits: [String],
		validUntil: {
			type: Date,
			get: function (date) {
				// Convert stored UTC date to IST before returning
				return moment(date).tz('Asia/Kolkata').format();
			},
		},
		isActive: Boolean,
	})
);

const OrderModel = mongoose.model(
	'Order',
	new mongoose.Schema({
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		orderPlacingDate: Date,
		orderExpiryDate: Date,
		paymentCompleteDate: Date,
		orderEndingDate: Date,
		offer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Offer',
		},
		discountedPrice: Number,
		//
		orderStatus: String,
		// to show details of what is the status especaiily in refund
		orderDescription: String,
		paymentStatus: String,
		orderType: String,
	})
);

const ImageModel = mongoose.model(
	'Image',
	new mongoose.Schema({
		name: {
			type: String,
			index: true,
			unique: true,
			required: true,
		},
		image: {
			type: Buffer,
		},
	})
);

module.exports = {
	User: UserModel,
	Device: DeviceModel,
	Policy: PolicyModel,
	Value: ValueModel,
	Image: ImageModel,
    Offer: OfferModel,
    Order: OrderModel
};
