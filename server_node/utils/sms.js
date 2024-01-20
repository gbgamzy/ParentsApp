var request = require('request');
const fs = require('fs');

const smsApi = 'f1809e24-e456-11ed-addf-0200cd936042';

var otpStatus = new Map();
var otpCount = 0;

readOtpCount();

// async function named sendOtp
async function sendOtp(phone) {
	if (phone == '1234567890') {
		return {
			statusCode: 200,
			message: 'Otp sent successfully',
			body: {},
		};
	}
	if (otpStatus.has(phone)) {
		// check if otp was sent 1 minute ago
		var time = otpStatus.get(phone).time;
		var date = new Date();
		var currentTime = date.getTime();
		if (currentTime - time < 60000) {
			return {
				statusCode: 500,
				message: 'Otp already sent, try again in 1 minute',
				body: {},
			};
		}
	}
	// get current date and time
	var date = new Date();
	var time = date.getTime();
	console.log(time);
	// generate 6 digit random number
	var otp = Math.floor(100000 + Math.random() * 900000);
	// put phone, otp and time in otpStatus map
	otpStatus.set(phone, { otp: otp, time: time });

	var options = {
		method: 'GET',
		url:
			'https://2factor.in/API/V1/' +
			smsApi +
			'/SMS/+91' +
			phone +
			'/' +
			otp +
			'/TeenCare',
		headers: {},
	};
	request(options, function (error, response) {
		if (error) {
			console.log(error);
			return {
				statusCode: 500,
				message: 'Internal Server Error',
				body: {},
			};
		}
		console.log(response.body);
	});
	// record phone and otp into a log file
	otpCount++;
	updateOtpCount();
	logOtp(phone);
	return {
		statusCode: 200,
		message: 'Otp sent successfully',
		body: {},
	};
}

async function cleanup() {
	// iterate through otpStatus map and delete all otps older than 5 minutes
	var date = new Date();
	var currentTime = date.getTime();
	otpStatus.forEach((value, key) => {
		if (currentTime - value.time > 300000) {
			otpStatus.delete(key);
		}
	});
}

// async function named verifyOtp
async function verifyOtp(phone, otp) {
	if (phone == '1234567890') {
		return {
			statusCode: 200,
			message: 'Otp verified successfully',
			body: {},
		};
	}
	// check if otpStatus map has phone number
	if (!otpStatus.has(phone)) {
		return {
			statusCode: 500,
			message: 'Otp not sent, retry',
			body: {},
		};
	}
	// check if otp is correct
	if (otpStatus.get(phone).otp == otp) {
		// check if otp was sent 5 minutes ago
		var time = otpStatus.get(phone).time;
		var date = new Date();
		var currentTime = date.getTime();
		if (currentTime - time > 300000) {
			return {
				statusCode: 500,
				message: 'Otp expired, retry',
				body: {},
			};
		}
		// delete phone number from otpStatus map
		otpStatus.delete(phone);
		return {
			statusCode: 200,
			message: 'Otp verified successfully',
			body: {},
		};
	}
	return {
		statusCode: 500,
		message: 'Otp verification failed',
		body: {},
	};
}



function readOtpCount() {
    fs.readFile('./static/values.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read file:', err);
            return;
        }
        const jsonData = JSON.parse(data);
        const otpCount = jsonData.otpCount;
        console.log('OTP Count:', otpCount);
    });
}

function updateOtpCount() {
    fs.readFile('./static/values.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read file:', err);
            return;
        }
        const jsonData = JSON.parse(data);
        jsonData.otpCount = otpCount;
        fs.writeFile('values.json', JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error('Failed to write to file:', err);
            }
        });
    });
}

function logOtp(phone) {
	const timestamp = new Date().toISOString();
	const logMessage = `${timestamp} - OTP sent to ${phone}. Total OTPs sent: ${otpCount}\n`;

	fs.appendFile('otp_log.log', logMessage, (err) => {
		if (err) {
			console.error('Failed to write to log file:', err);
		}
	});
}

// export all functions
module.exports = {
	sendOtp,
	verifyOtp,
    cleanup,
    readOtpCount,
    updateOtpCount
};
