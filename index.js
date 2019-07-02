require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();

let wChannels = []; // Contains list of channels to watch

// Init
client.on("ready", async () => {

    // Set client presence
    try {
        await client.user.setActivity("@mention me a in a channel");
        console.log("Set client presence");
    }
    catch (e) {
        console.error("An error has occurred while setting presence");
        throw e;
    }
    console.log("W-Bot is online");
});

client.login(process.env.TOKEN);

// Main
client.on("message", msg => {

    // Ignore any messages that are my own
    if(msg.author.id == client.user.id)
    {
        return;
    }

    // Check for @mention to begin watching chat in the channel mentioned from
    if(msg.mentions.users.find(user => user.id == client.user.id))
    {
        // Add the channel to the watch list if not already in it
        let curChannelIndex = wChannels.indexOf(msg.channel.id);
        if(curChannelIndex === -1)
        {
            wChannels.push(msg.channel.id);
            msg.reply(`W-Bot has beeen added to this channel. Mention me again in this channel to remove me.`);
            console.log(`Added W-Bot to channel ${msg.channel.id}`);
        }
        // Checks if channel is already being watched, if so remove the channel from the watch list
        else
        {
            wChannels.splice(curChannelIndex, 1);
            msg.reply(`W-Bot has been removed from this channel. Mention me again in this channel to add me back.`);
            console.log(`Removed W-Bot from channel ${msg.channel.id}`);
        }
    }
});

// Ctrl + C
process.on("SIGINT", () => {
    console.log("Terminating connection");
    client.destroy();
    process.exit();
});
