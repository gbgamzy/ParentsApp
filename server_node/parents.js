const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { listenForEnrollments } = require('./utils/subscription');
const fileUpload = require('express-fileupload');
var MongoClient = require('mongodb').MongoClient;

const { userRoute } = require('./user');
const { rzpRoute } = require('./rzp');
const homeRoute = require('./home');
const adminRoute = require('./admin');
const { admin } = require('googleapis/build/src/apis/admin');
// var admin = require("firebase-admin");

const live_mode = true;

mongoose.set('strictQuery', false);
mongoose
	.connect('mongodb://gbdev:okWNsim6@127.0.0.1:27017/parentsdb', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 30000,
		connectTimeoutMS: 30000,
	})
	.then((result) => console.log('db connected'))
	.catch((err) => console.log(err));

const subscriptionName = 'EMIGAPS_SUBSCRIPTION';
try {
	listenForEnrollments(subscriptionName).catch(console.error);
} catch (e) {
	console.log(e);
}

// Use Express middleware for handling JSON and URL-encoded form data
const app = express();

app.use(
	cors({
		origin: '*',
	})
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Increase the limit for express-fileupload
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } })); // 5MB

app.use('/user', userRoute);
app.use('/home', homeRoute);
app.use('/admin', adminRoute);
app.use('/rzp', rzpRoute);

app.listen(3005, () => {
	console.log('Server started on http://localhost:3005');
});

module.exports = {
	live_mode: live_mode,
};
