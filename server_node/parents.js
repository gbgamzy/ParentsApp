var http = require('http');
const express = require('express');
const mongoose = require('mongoose');
var events = require('events');
const cors = require('cors');
const { listenForEnrollments } = require('./subscription');
const fileUpload = require('express-fileupload');
var MongoClient = require('mongodb').MongoClient;
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




// ******************************

//const postRoute=require('./routes/School1');

const userRoute=require('./user');


// var serviceAccount = require("./key.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://doc-n-book-default-rtdb.asia-southeast1.firebasedatabase.app"
// });
// var db = admin.database();


app.use('/user', userRoute);


app.listen(3005, () => {
    console.log('Server started on http://localhost:3005');
});

// export admin
// module.exports = {
//     db: db
// };




