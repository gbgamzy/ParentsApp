const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { listenForEnrollments } = require('./utils/subscription');
const fileUpload = require('express-fileupload');
var MongoClient = require('mongodb').MongoClient;

const {userRoute} = require('./user');
const homeRoute=require('./home');
const adminRoute=require('./admin');
const { admin } = require('googleapis/build/src/apis/admin');
// var admin = require("firebase-admin");


mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/parentsdb', { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((result) => console.log("db connected"))
.catch(err => console.log(err));

const subscriptionName = 'EMIGAPS_SUBSCRIPTION';
try {
    listenForEnrollments(subscriptionName).catch(console.error);
}
catch (e) {
    console.log(e);
}


// Use Express middleware for handling JSON and URL-encoded form data
const app=express();

app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));

app.use('/user', userRoute);
app.use('/home', homeRoute);
app.use('/admin', adminRoute);

app.listen(3005, () => {
    console.log('Server started on http://localhost:3005');
});




