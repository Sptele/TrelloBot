const { SlashCommandBuilder } = require("@discordjs/builders");
const members = require("../../members.json");
const { put } = require("../lib/fetch");
const { read, write, drop } = require("../../card-list.js");
require("dotenv").config();

function range(num) {
	const arr = [];
	for (let i = 0; i < num; i++) {
		arr.push(i);
	}

	return arr;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("assign")
		.setDescription(
			"If an urgent article is created, assign a member to cover it."
		)
		.addStringOption((option) =>
			option
				.setName("member")
				.setDescription("The member of Trello.")
				.setRequired(true)
				.addChoices(
					...members.map((obj) => {
						return {
							name: obj.name,
							value: obj.name + "<|!!||!!|>" + obj.id,
						};
					})
				)
		)
		.addIntegerOption((option) =>
			option
				.setName("identifier")
				.setDescription("The id of the message that notified you.")
				.setRequired(true)
				.addChoices(
					...range(read().length - 1).map((el) => {
						return { name: el, value: el };
					})
				)
		),
	async execute(interaction) {
		const currentNotifs = read();

		const stuffs = interaction.options
			.getString("member")
			.split("<|!!||!!|>");

		const response = await put(
			`/1/cards/${
				currentNotifs[interaction.options.getInteger("identifier")]
			}`,
			{
				cover: { color: "red" },
				idMembers: stuffs[1],
				idList: process.env.IN_PROGRESS_ID,
			}
		);

		// Remove from the list of notifs
		drop(interaction.options.getInteger("identifier"));

		console.log(response);

		if (response.status === 200) {
			await interaction.reply(
				"Done! Added member called " +
					stuffs[0] +
					" with id " +
					stuffs[1] +
					" to the card. Complete it RIGHT NOW!"
			);
		} else {
			await interaction.reply("Error! Please try again later, or carry out the action manually. <@683835438091599904> please check server logs.");
		}
	},
};
