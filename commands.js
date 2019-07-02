let commands = {
    "cooldowns": {
        helpMsg: "Shows the cooldown timer until another message can be sent for every user.",
        async exec(msg, bot, wChannels) {
            msg.delete();

            let channel = msg.channel.id;
            let users = Object.keys(wChannels[channel]);
            let cooldowns = [];
            for(userId of Object.keys(wChannels[channel]))
            {
                let timeDifference = new Date((30 * 60 * 1000) - msg.timestamp - wChannels[channel][userId].lastMessageTime);
                let data = {
                    name: (await bot.users.find(user => user.id === userId).username),
                    value: timeDifference > 0 ? `${timeDifference.getMinutes()}:${timeDifference.getSeconds()}` : "0:00"
                };
                cooldowns.push(data);
            }
            let embed = {
                "content": "*This message will self destruct in 1 minute.*",
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
                            "value": cooldowns.map(item => item.value).join("\n"),
                            "inline": true
                        }
                    ]
                }
            }
            let myMsg = await bot.createMessage(msg.channel.id, embed);
            setTimeout(() => { myMsg.delete(); }, 1 * 60 * 1000);
        }
    },
    "scores": {
        helpMsg: "Shows the current scores for all players.",
        async exec(msg, bot, wChannels) {
            msg.delete();

            let channel = msg.channel.id;
            let users = Object.keys(wChannels[channel]);
            let scores = [];
            for(userId of Object.keys(wChannels[channel]))
            {
                let data = {
                    name: (await bot.users.find(user => user.id === userId).username),
                    value: wChannels[channel][userId].score
                };
                scores.push(data);
            }
            let embed = {
                "content": "*This message will self destruct in 1 minute.*",
                "embed": {
                    "title": "Scores",
                    "description": "Time remaining for each user until another message can be sent",
                    "color": 15625592,
                    "timestamp": new Date(),
                    "footer": {
                        "icon_url": msg.author.avatarURL,
                        "text": "Requested by " + msg.author.username
                    },
                    "thumbnail": {
                        "url": "https://i.pinimg.com/originals/ba/8b/fd/ba8bfdbe80cc37713774c525ad0c47c0.png"
                    },
                    "fields": [{
                            "name": "User",
                            "value": scores.map(item => item.name).join("\n"),
                            "inline": true
                        },
                        {
                            "name": "Time remaining",
                            "value": scores.map(item => item.value).join("\n"),
                            "inline": true
                        }
                    ]
                }
            }
            let myMsg = await bot.createMessage(msg.channel.id, embed);
            setTimeout(() => { myMsg.delete(); }, 1 * 60 * 1000);
        }
    },
    "help": {
        helpMsg: "Displays the message you are seeing.",
        async exec(msg, bot, wChannels) {
            let embed = {
                "content": "*This message will self destruct in 1 minute.*",
                "embed": {
                    "title": "W-Bot Commands",
                    "description": "General usage: `!!<command>`",
                    "color": 12153551,
                    "timestamp": new Date(),
                    "footer": {
                        "icon_url": msg.author.avatarURL,
                        "text": "Requested by " + msg.author.username
                    },
                    "fields": Object.keys(commands).map(command => {
                        return {
                            "name": command,
                            "value": commands[command].helpMsg
                        }
                    })
                }
            }
            let myMsg = await bot.createMessage(msg.channel.id, embed);
            setTimeout(() => { myMsg.delete() }, 1 * 60 * 1000);
        }
    }
}

module.exports = commands;
