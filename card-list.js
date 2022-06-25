const fs = require("node:fs");

function read() { 
	const cards = require("./cards.json");
	return cards;
}

function write(id) {

	const arr = read();
	arr.push(id);

	fs.writeFile("./cards.json", JSON.stringify(arr), (err) => {
		if (err) return console.log(err);
	});

	return read();
}

function drop(index) {
	
	const arr = read();
	arr.splice(index, 1);

	fs.writeFile("./cards.json", JSON.stringify(arr), (err) => {
		if (err) return console.log(err);
	});

	return read();
}

module.exports = {
	read, write, drop
}