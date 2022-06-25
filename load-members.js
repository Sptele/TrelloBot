require("dotenv").config();
const { get } = require("./src/lib/fetch.js");
const fs = require("node:fs");

const response = await get(
	`/1/boards/${process.env.BOARD_ID}/memberships`
);


async function grabMembers() { 
	const arr = [];

	for (const v of response.data) {
		const member = await get("/1/members/" + v.idMember, false);
		arr.push({ name: member.data.fullName, id: member.data.id });
	}
	return arr;
}

const allNames = await grabMembers();


console.log(allNames);

fs.writeFile("./members.json", JSON.stringify(allNames), (err) => {
	if (err) return console.log(err);

	console.log("Success in writing to members.json.");
});
