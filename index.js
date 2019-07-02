require("dotenv").config();

const storage = require("node-persist");

const Eris = require("eris");
let bot = new Eris(process.env.TOKEN);

const commands = require("./commands.js");

let wChannels = {}; // Contains different channels with users

(async () => {
    await storage.init();
    let wChannels = await storage.getItem("wChannels") || {}; // Contains active channels with users
    // Init
    bot.on("ready", () => {
        console.log("W-Bot is online");

        // Set client presence
        try {
            bot.editStatus("online", { name: "@mention me a in a channel", type: 0 });
            console.log("Set bot presence");
        }
        catch (e) {
            console.error("An error has occurred while setting presence");
            throw e;
        }
    });

    // Main
    bot.on("messageCreate", async msg => {

        // Ignore any messages that are my own
        if(msg.author.id == bot.user.id)
        {
            return;
        }

        // Check for @mention to begin watching chat in the channel mentioned from
        if(msg.mentions.find(user => user.id == bot.user.id))
        {
            // Add the channel to the watch list if not already in it
            if(!wChannels[msg.channel.id])
            {
                wChannels[msg.channel.id] = {};
                bot.createMessage(msg.channel.id, `W-Bot has beeen added to this channel. Mention me again in this channel to remove me.`);
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
                bot.createMessage(msg.channel.id, `W-Bot has been removed from this channel. Mention me again in this channel to add me back.`);
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
            // If message is a command
            if(msg.content.substr(0, 2) == "!!")
            {
                if(commands[msg.content.substr(2)])
                {
                    commands[msg.content.substr(2)].exec(msg, bot, wChannels);
                }
                else
                {
                    msg.delete();
                    let myMsg = await bot.createMessage(msg.channel.id, "Unknown command. Type `;;help` for a list of commands.\n*This message will self destruct in 1 minute*");
                    setTimeout(() => { myMsg.delete(); }, 1 * 60 * 1000);
                }
                return;
            }

            // If message is not 'w'
            if(msg.content != "w")
            {
                let myMsg = await bot.createMessage(msg.channel.id, "Only a lowercase 'w' is valid. Your message was deleted.\n*This message will self destruct in 1 minute*");
                setTimeout(() => { myMsg.delete(); }, 1 * 60 * 1000);
                try {
                    msg.delete();
                }
                catch (e)
                {
                    bot.createMessage(msg.channel.id, `Unable to delete message: ${e}`);
                }
                return;
            }

            // Add new user to competition if not already in it
            if(!wChannels[msg.channel.id][msg.author.id])
            {
                wChannels[msg.channel.id][msg.author.id] = {
                    lastMessageTime: msg.timestamp,
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
            if(msg.timestamp - wChannels[msg.channel.id][msg.author.id].lastMessageTime < 30 * 60 * 1000)
            {
                let timeleft = new Date((30 * 60 * 1000) - (msg.timestamp - wChannels[msg.channel.id][msg.author.id].lastMessageTime));
                let myMsg = await bot.createMessage(msg.channel.id, `You can only send a message every 30 minutes (${timeleft.getMinutes()}:${timeleft.getSeconds()} left)\n*This message will self destruct in 1 minute*`);
                setTimeout(() => { myMsg.delete(); }, 1 * 60 * 1000);
                return;
            }

            // Increment score
            wChannels[msg.channel.id][msg.author.id].score++;
            wChannels[msg.channel.id][msg.author.id].lastMessageTime = msg.timestamp;
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
        console.log(wChannels);
        for(channel of Object.keys(wChannels))
        {
            try
            {
                let rankings = [];
                for(userId of Object.keys(wChannels[channel]))
                {
                    rankings.push({ id: (await bot.users.find(user => user.id === userId)).username, score: wChannels[channel][userId].score });
                }
                rankings.sort((a, b) => { return a.score > b.score});
                let topicString = [
                    rankings[0] ? `:first_place: ${rankings[0].id} (${rankings[0].score} points)` : null,
                    rankings[1] ? `:second_place: ${rankings[0].id} (${rankings[0].score} points)` : null,
                    rankings[2] ? `:third_place: ${rankings[0].id} (${rankings[0].score} points)` : null
                ].filter(item => item != null).join(" | ");
                bot.getChannel(channel).edit({topic: topicString});
            }
            catch (e)
            {
                bot.createMessage(channel, `Could not update topic: ${e}`);
            }
        }
    }

    bot.connect();

    // Ctrl + C
    process.on("SIGINT", () => {
        console.log("Terminating connection");
        bot.disconnect();
        process.exit();
    });

})();
