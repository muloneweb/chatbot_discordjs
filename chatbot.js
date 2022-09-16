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

        let userId = interaction.user.id
        let findinDB = await db1.collection('Applications').find({ [userId]: { "$exists": true } }).toArray();

        if (findinDB.length == 0) {
            try {
                interaction.reply({ content: 'Bot DMs you', ephemeral: true })
                const exampleEmbed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`question1`)

                interaction.user.send({ embeds: [exampleEmbed] })
                await db1.collection('Applications').updateOne({ _id: ObjectId("62bf7e5770161c5928c2f6bc") }, { $set: { [userId]: { answers: [] } } })
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
        let userId = msg.author.id.toString()

        //only record messages that do not come from the bot
        if (userId !== botId) {

            let findinDB = await db1.collection('Applications').find({ [userId]: { "$exists": true } }).toArray();
            let answersArray = findinDB[0][userId].answers
            answersArray.push(sanitize(msg.content))
            await db1.collection('Applications').updateOne({ _id: ObjectId("62bf7e5770161c5928c2f6bc") }, { $set: { [userId]: { answers: answersArray } } })

            for (let i = 0; i < questions.length - 1; i++) {
                if (answersArray[i] == undefined) {
                    const exampleEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(questions[i])
                    msg.reply({ embeds: [exampleEmbed] })
                }
                break
            }

            if (questions.length === answersArray.length) {
                const channel = client.channels.cache.get("<CHANNELID_TO_SEND>")
                const thread = await channel.threads.create({
                    name: `📋 New Application`,
                    auto_archive_duration: 1440,
                    type: 'GUILD_PUBLIC_THREAD'
                });

                let findinDB = await db1.collection('Applications').find({ [userId]: { "$exists": true } }).toArray();
                let answers = findinDB[0][userId].answers
                const exampleEmbed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`New Application`)
                    .setAuthor({ name: `${msg.author.username}` }) 
                    .setThumbnail(`https://cdn.discordapp.com/avatars/${resp.id}/${resp.avatar}.png`)
                    .addFields(
                        { name: `${questions[0]}`, value: "```" + `${answers[0]}` + "```", inline: false },
                        { name: `${questions[1]}`, value: "```" + `${answers[1]}` + "```", inline: false },
                        { name: `${questions[2]}`, value: "```" + `${answers[2]}` + "```", inline: false },
                        { name: `${questions[3]}`, value: "```" + `${answers[3]}` + "```", inline: false },
                        { name: `${questions[4]}`, value: "```" + `${answers[4]}` + "```", inline: false },
                        { name: `${questions[5]}`, value: "```" + `${answers[5]}` + "```", inline: false },
                        { name: `${questions[6]}`, value: "```" + `${answers[6]}` + "```", inline: false },
                        { name: `${questions[7]}`, value: "```" + `${answers[7]}` + "```", inline: false },
                        { name: `${questions[8]}`, value: "```" + `${answers[8]}` + "```", inline: false },
                    )
                    .setFooter({ text: userId }); 
                
            client.channels.cache.get(thread.id).send({
			content: `New Application from: <@${resp.id}> <@&502931648195723264>`, //<@&502931648195723264>
			embeds: [exampleEmbed]
	        });
            }
        }
    } catch (e) {
        console.log(e)
    }
});

client.login(token);

app.listen(4000, () => console.log("Server started"))
