require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();

let wChannels = {}; // Contains different channels with users

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
        if(!wChannels[msg.channel.id])
        {
            wChannels[msg.channel.id] = [];
            msg.reply(`W-Bot has beeen added to this channel. Mention me again in this channel to remove me.`);
            console.log(`Added W-Bot to channel ${msg.channel.id}`);
        }
        // Checks if channel is already being watched, if so remove the channel from the watch list
        else
        {
            delete wChannels[msg.channel.id];
            msg.reply(`W-Bot has been removed from this channel. Mention me again in this channel to add me back.`);
            console.log(`Removed W-Bot from channel ${msg.channel.id}`);
        }
        return;
    }

    // Executed if a message is sent in a wChannel
    if(wChannels[msg.channel.id])
    {
        // If message is not 'w'
        if(msg.content != "w")
        {
            msg.reply("Only a lowercase 'w' is valid. Your message was deleted.");
            try {
                msg.delete();
            }
            catch (e)
            {
                msg.reply(`Unable to delete message: ${e}`);
            }
            return;
        }

        // Add new user to competition if not already in it
        if(!wChannels[msg.channel.id][msg.author.id])
        {
            wChannels[msg.channel.id][msg.author.id] = {
                lastMessageTime: msg.createdTimestamp,
                score: 1
            };
            return;
        }

        // Check if message was sent too quickly
        if(msg.createdTimestamp - wChannels[msg.channel.id][msg.author.id].lastMessageTime < 30 * 60 * 1000)
        {
            let timeleft = new Date((30 * 60 * 1000) - (msg.createdTimestamp - wChannels[msg.channel.id][msg.author.id].lastMessageTime));
            msg.reply(`You can only send a message every 30 minutes (${timeleft.getMinutes()}:${timeleft.getSeconds()} left)`);
            return;
        }

        // Increment score
        wChannels[msg.channel.id][msg.author.id].score++;
        wChannels[msg.channel.id][msg.author.id].lastMessageTime = msg.createdTimestamp;
    }
});

// Shows the top 3 positions / scores in the topic. Updates every second
setInterval(updateTopic, 1000);
function updateTopic() {

}

setInterval(updatePins, 1000);
// Shows all scores with bar graphs and cooldown times in the pinned messages. Updates every second
function updatePins() {

}

// Ctrl + C
process.on("SIGINT", () => {
    console.log("Terminating connection");
    client.destroy();
    process.exit();
});
