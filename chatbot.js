const fs = require('fs')
const fetch = require("node-fetch");
const express = require('express');
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require("mongodb");
const uri = "mongodb://127.0.0.1:27017/";
const monclient = new MongoClient(uri);
const { Client, Intents, MessageEmbed, ContextMenuInteraction } = require('discord.js');
const { token } = require('./config2.json');
const sanitize = require('mongo-sanitize');
const client = new Client({ partials: ['GUILD_MEMBER', "CHANNEL"], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] }); //Intents.FLAGS.GUILD_MESSAGES

const app = express()
monclient.connect();
const db1 = monclient.db("wn")

//Application starts by pushing a button. First question is sent through direct messages.
client.on('interactionCreate', async interaction => {
    const { commandName } = interaction

    if (interaction.customId == "STARTAPP") {

        let userid = interaction.user.id
        let findinDB = await db1.collection('Applications').find({ [userid]: { "$exists": true } }).toArray();

        if (findinDB.length == 0) {
            try {
                interaction.reply({ content: 'Bot DMs you', ephemeral: true })
                const exampleEmbed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`question1`)

                interaction.user.send({ embeds: [exampleEmbed] })
                await db1.collection('Applications').updateOne({ _id: ObjectId("62bf7e5770161c5928c2f6bc") }, { $set: { [userid]: { questions: [] } } })
            } catch (e) {
                console.log(e)
                await interaction.reply({ "content": `<@${interaction.user.id}> The bot cannot start the Direct Message process: you probably have to enable Direct Messages in your settings. Then apply again`, ephemeral: true, "allowedMentions": { "replied_user": false, "parse": [] } })
            }
        } else {
            interaction.reply({
                content: 'You already have an application. Check the bot DMs to see if you answered all the questions. If you did, ping a Recruit officer.',
                ephemeral: true,
            })
        }

    }
})


//listens for incoming messages events
client.on('messageCreate', async (msg) => {

    const questions = ["question1",
        "question2",
        "question3",
        "question4",
        "question5",
        "question6",
        "question7",
        "question8",
        "question9"]


    try {
        const botId = "<BOT_ID_NUMBER>"
        let userid = msg.author.id.toString()

        //only record messages that do not come from the bot
        if (userid !== botId) {

            let findinDB = await db1.collection('Applications').find({ [userid]: { "$exists": true } }).toArray();
            let questionsArray = findinDB[0][userid].questions
            questionsArray.push(sanitize(msg.content))
            await db1.collection('Applications').updateOne({ _id: ObjectId("62bf7e5770161c5928c2f6bc") }, { $set: { [userid]: { questions: questionsArray } } })

            for (let i = 0; i < questions.length - 1; i++) {
                if (questionsArray[i] == undefined) {
                    const exampleEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(questions[i])
                    msg.reply({ embeds: [exampleEmbed] })
                }
                break
            }
        }
    } catch (e) {
        console.log(e)
    }
});

client.login(token);

app.listen(4000, () => console.log("Server started"))