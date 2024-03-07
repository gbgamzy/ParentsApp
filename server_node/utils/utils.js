var deviceOtps = new Set();

function generateRandomWord(length) {
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let randomWord = 'TC-';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		randomWord += characters.charAt(randomIndex);
    }
    deviceOtps.has(randomWord) ? randomWord = generateRandomWord(length) : deviceOtps.add(randomWord);
	
	return randomWord;
}

function redeemRandomWord(word) {
    deviceOtps.delete(word);
}

module.exports = {
    generateRandomWord,
    redeemRandomWord,

};