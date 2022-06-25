/* A homebuilt fetch api using axios designed for trello. */

const axios = require("axios");
require("dotenv").config();

function generateHeader(method, url, includeKey=true) {
	return {
		method: method,
		url:
			"https://api.trello.com" + url +
			(includeKey ? `?key=${process.env.TRELLO_KEY}&token=${process.env.TRELLO_TOKEN}` : ""),
		headers: {
			Accept: "application/json",
		},
		json: true,
	};
}

/**
 * Makes a get request to trello.
 * @param {String} url The URL to fetch from, EXCLUDING the API key and token, as well as the url up to 1/. That is handled here
 * @returns
 */
async function get(url, includeKey=true) {
	try {
		let response = await axios(generateHeader("get", url, includeKey));
		return response;
	} catch (err) {
		console.error(err);
	}
}

/**
 * Makes a PUT (Update) request to trello.
 * @param {String} url The URL to send to, EXCLUDING the API key and token, as well as the url up to 1/. That is handled here
 * @returns
 */
async function put(url, content) {
	try {
		let response = await axios({ 
			...generateHeader("put", url), 
			data: content,
		});
		return response;
	} catch (err) {
		console.error(err);
	}
}

module.exports = {
	get, put
}


