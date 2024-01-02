const express = require('express');
const fs = require('fs');
const router = express.Router();

router.get('/privacy_policy', async (req, res) => {
	console.log('Getting Privacy Policy');
	// fs.readdir('./server_node/static/privacy.txt', (err, files) => {
	// 	if (err) {
	// 		console.error('Error reading directory:', err);
	// 		return;
	// 	}

	// 	// Output the list of files and directories
	// 	console.log('Files and directories in', ':');
	// 	files.forEach((file) => {
	// 		console.log(file);
	// 	});
	// });

	fs.readFile('./server_node/static/privacy.txt', 'utf8', (err, data) => {
		if (err) {
			// Handle file read error
			console.error('Error reading file:', err);
			res.status(500).send({
				message: 'Internal server error',
				body: err,
			});
		} else {
			// Send the file data as the HTTP response
			res.status(200).send({
				policy: data,
			});
		}
	});
});

module.exports = router;
