let commands = {
    "cooldowns": {
        helpMsg: "Shows the cooldown timer until another message can be sent for every user.",
        usage: "!!cooldowns",
        async exec(msg, bot, wChannels) {
            let channel = msg.channel.id;
            let users = Object.keys(wChannels[channel]);
            let cooldowns = [];
            for(userId of Object.keys(wChannels[channel]))
            {
                let data = {
                    name: (await bot.users.find(user => user.id === userId).username),
                    value: new Date((30 * 60 * 1000) - msg.timestamp - wChannels[channel][userId].lastMessageTime)
                };
                cooldowns.push(data);
            }
            let embed = {
                "embed": {
                    "title": "Cooldowns",
                    "description": "Time remaining for each user until another message can be sent",
                    "color": 8636631,
                    "timestamp": new Date(),
                    "footer": {
                        "icon_url": msg.author.avatarURL,
                        "text": "Requested by " + msg.author.username
                    },
                    "thumbnail": {
                        "url": "https://kendrickfincher.org/wp-content/uploads/2013/11/cooldownicon-150x150.png"
                    },
                    "fields": [{
                            "name": "User",
                            "value": cooldowns.map(item => item.name).join("\n"),
                            "inline": true
                        },
                        {
                            "name": "Time remaining",
                            "value": cooldowns.map(item => `${item.value.getMinutes()}:${item.value.getSeconds()}`).join("\n"),
                            "inline": true
                        }
                    ]
                }
            }
            bot.createMessage(msg.channel.id, embed);
        }
    },
    "help": {
        helpMsg: "Displays the message you are seeing.",
        usage: "!!help",
        async exec(msg, bot, wChannels) {
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
            let myMsg = await bot.createMessage(msg.channel.id, messageString);
            setTimeout(() => { myMsg.delete() }, 1 * 60 * 1000);
        }
    }
}

module.exports = commands;
