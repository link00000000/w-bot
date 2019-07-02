require("dotenv").config();

const storage = require("node-persist");

const Discord = require("discord.js");
const client = new Discord.Client();

let wChannels = {}; // Contains different channels with users

(async () => {
    await storage.init();
    let wChannels = await storage.getItem("wChannels") || {}; // Contains active channels with users
    console.log(wChannels);
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
    client.on("message", async msg => {

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
                wChannels[msg.channel.id] = {};
                msg.reply(`W-Bot has beeen added to this channel. Mention me again in this channel to remove me.`);
                console.log(`Added W-Bot to channel ${msg.channel.id}`);
                try
                {
                    await storage.setItem('wChannels', wChannels);
                }
                catch (e)
                {
                    console.error(`There was an error writing to database: ${e}`);
                }
            }
            // Checks if channel is already being watched, if so remove the channel from the watch list
            else
            {
                delete wChannels[msg.channel.id];
                msg.reply(`W-Bot has been removed from this channel. Mention me again in this channel to add me back.`);
                console.log(`Removed W-Bot from channel ${msg.channel.id}`);
                try
                {
                    await storage.setItem('wChannels', wChannels);
                }
                catch (e)
                {
                    console.error(`There was an error writing to database: ${e}`);
                }
            }
            return;
        }

        // Executed if a message is sent in a wChannel
        if(wChannels[msg.channel.id])
        {
            // If message is not 'w'
            if(msg.content != "w")
            {
                let myMsg = await msg.reply("Only a lowercase 'w' is valid. Your message was deleted.\n*This message will self destruct in 1 minute*");
                setTimeout(() => { myMsg.delete(); }, 1 * 60 * 1000);
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
                try
                {
                    await storage.setItem('wChannels', wChannels);
                }
                catch (e)
                {
                    console.error(`There was an error writing to database: ${e}`);
                }
                return;
            }

            // Check if message was sent too quickly
            console.log("============" + JSON.stringify(wChannels));
            if(msg.createdTimestamp - wChannels[msg.channel.id][msg.author.id].lastMessageTime < 30 * 60 * 1000)
            {
                let timeleft = new Date((30 * 60 * 1000) - (msg.createdTimestamp - wChannels[msg.channel.id][msg.author.id].lastMessageTime));
                let myMsg = await msg.reply(`You can only send a message every 30 minutes (${timeleft.getMinutes()}:${timeleft.getSeconds()} left)\n*This message will self destruct in 1 minute*`);
                setTimeout(() => { myMsg.delete(); }, 1 * 60 * 1000);
                return;
            }

            // Increment score
            wChannels[msg.channel.id][msg.author.id].score++;
            wChannels[msg.channel.id][msg.author.id].lastMessageTime = msg.createdTimestamp;
            try
            {
                await storage.setItem('wChannels', wChannels);
            }
            catch (e)
            {
                console.error(`There was an error writing to database: ${e}`);
            }
        }
    });

    // Shows the top 3 positions / scores in the topic. Updates every second
    setInterval(updateTopic, 1000);
    async function updateTopic() {
      for(channel of Object.keys(wChannels))
        {
            try
            {
                let rankings = [];
                console.log(JSON.stringify(wChannels));
                for(user of Object.keys(wChannels[channel]))
                {
                    rankings.push({ id: (await client.users.fetch(user)).username, score: wChannels[channel][user].score });
                }
                rankings.sort((a, b) => { return a.score > b.score});
                let topicString = [
                    rankings[0] ? `:first_place: ${rankings[0].id} (${rankings[0].score} points)` : null,
                    rankings[1] ? `:second_place: ${rankings[0].id} (${rankings[0].score} points)` : null,
                    rankings[2] ? `:third_place: ${rankings[0].id} (${rankings[0].score} points)` : null
                ].filter(item => item != null).join(" | ");
                client.channels.find(ch => ch.id === channel).setTopic(topicString);
            }
            catch (e)
            {
                client.channels.find(ch => ch.id === channel).send(`Could not update topic: ${e}`);
            }
        }
    }

    // Ctrl + C
    process.on("SIGINT", () => {
        console.log("Terminating connection");
        client.destroy();
        process.exit();
    });

})();
