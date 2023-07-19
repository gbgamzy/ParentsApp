const { google } = require('googleapis');
const key = require('./ama.json');

const auth = new google.auth.GoogleAuth({
    keyFile: './ama.json',
    scopes: 'https://www.googleapis.com/auth/androidmanagement',
});

const client = await auth.getClient();
google.options({ auth: client });


