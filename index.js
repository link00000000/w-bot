require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
    console.log("Discord w-bot is online");
});

client.on("message", msg => {
    if(msg.content === "test")
    {
        msg.reply("[w-bot] test successful!");
    }
});

client.login(process.env.TOKEN);

process.on("SIGINT", () => {
    console.log("Terminating connection");
    client.destroy();
});
