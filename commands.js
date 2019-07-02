let commands = {
    "cooldowns": {
        helpMsg: "Shows the cooldown timer until another message can be sent for every user.",
        usage: "!!cooldowns",
        async exec(msg, client, wChannels) {
            let channel = msg.channel.id;
            let users = Object.keys(wChannels[channel]);
            let cooldowns = [];
            for(user of Object.keys(wChannels[channel]))
            {
                let data = { name: (await client.users.fetch(user).username) , value: (30 * 60 * 1000) - msg.createdTimestamp - user.lastMessageTime };
                cooldowns.push(`${name} - ${new Date(value).getMinutes()}:${new Date(value).getSeconds()} remaining`);
            }
        }
    },
    "help": {
        helpMsg: "Displays the message you are seeing.",
        usage: "!!help",
        async exec(msg, client, wChannels) {
            let messageString = [
                "\n\n**_W-Bot Commands_**\nBasic usage:\n\t\t\t\t!!<command>"
            ];
            for(command in commands)
            {
                messageString.push(
                    [
                        `\`${command}\``,
                        `\t\t\t\t${commands[command].helpMsg}`
                    ].join("\n")
                );
            }
            messageString = messageString.join("\n\n");
            messageString += "\n\n\n*This message will self destruct in 1 minute*";
            let myMsg = await msg.reply(messageString);
            setTimeout(() => { myMsg.delete() }, 1 * 60 * 1000);
        }
    }
}

module.exports = commands;
