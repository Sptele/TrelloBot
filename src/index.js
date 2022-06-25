require("dotenv").config();
const { Client, Collection, Intents } = require("discord.js"); //import discord.js
const { MessageEmbed } = require("discord.js");
const { get } = require("./lib/fetch.js");
const fs = require("node:fs");
const path = require("node:path");
const { read, write } = require("../card-list");
const { channelToSendTo, spteleId } = require("../discord.config.json");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] }); //create new client

client.once("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
	const channel = client.channels.cache.get(channelToSendTo);
	channel.send("Bot Online");
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

process.on("unhandledRejection", (error) => {
	console.error("Unhandled promise rejection:", error);
});

// The main timer driver
setInterval(async () => {
	try {
		const response = await get(
			`/1/lists/${process.env.PRODUCT_BACKLOG_ID}/cards`
		);

		const currentUnanswered = read();

		response?.data?.forEach((card) => {
			if (!currentUnanswered.includes(card.id)) {
				const descIsUrgent = card.desc.split("--|--")[0].split("\n")[0]; // Split it by our delimiter.
				if (descIsUrgent && descIsUrgent === "<[%Yes%]>") {
					console.log(write(card.id)); // Ensure I don't spam ping

					const channel = client.channels.cache.get(channelToSendTo);
					const urgentEmbed = new MessageEmbed()
						.setColor("RED")
						.setTitle("Urgent Article Sent!")
						.setURL(card.url)
						.setDescription(
							"An Urgent Article has been created. You must resolve this by deciding who will complete the article. This article is time-sensitize, and due in **THREE DAYS**."
						)
						.addField(
							"Due Date",
							new Date(
								new Date(
									new Date().setHours(0, 0, 0, 0)
								).getTime() + 259200000 // One day in MS
							).toUTCString(),
							false // Inline
						)
						.addField(
							"This Card's ID that you must reference by is",
							read().length - 1 + "",
							false
						)
						.setFooter({
							text: `Created by Gautam Khajuria (<@${spteleId}>) for Gen Z: We Are The Future`,
						});

					channel.send("Ping: " /* + TODO: Ping */);
					channel.send({ embeds: [urgentEmbed] });
				}
			}
		});
	} catch (e) {
		const channel = await client.users.fetch(spteleId); // Sptele id
		channel.send("Hey, I detected an error. Check it out:");
		channel.send(e.message);
	}
}, 5000);

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: "There was an error while executing this command!",
			ephemeral: true,
		});
	}
});

//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login bot using token
