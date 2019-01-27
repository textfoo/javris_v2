const { prefix, token } = require('../../config/config.json'); 
const fs = require('fs'); 
const Discord = require('discord.js'); 
const client = new Discord.Client(); 

const NLPModelManager = require("../../nlp/core/nlp-model-manager");
const nlp = new NLPModelManager(); 

const Logger = require('../../utility/logger');

class Bot {
    constructor() {
        Logger.info('Loading Bot...'); 
        this.client = client; 
        this.loadCommands(); 
        this.client.on('message', async message => this.msg(message));
        this.client.on('ready', async () => {
            await nlp.constructModels();
            Logger.info(`Bot Status - Ready : {
                client-id   : ${client.user.id}, 
                username    : ${client.user.username},
                is-bot      : ${client.user.bot}
            }`);
        }); 
        this.client.login(token);
    }


    async msg(message) {
        try{
            if(message.content.indexOf(client.user.id) > -1) {
                message.content = message.content.replace(`<@${client.user.id}>`, '').trim();
                const trimmed = message.content.replace(/'.*?'/g, ''); 
                Logger.info(`bot-core | content : ${message.content} | trimmed : ${trimmed}`);
                const analysis = await nlp.analyze(trimmed);
                await Promise.all(analysis.map(async (item) => {
                    //the root command is the first signifier as to which discord-bot command we'll route too
                    const root = item.label.split('-')[0]; 
                    if(client.commands.has(root)) {
                        Logger.info(`Bot | msg | cmd : ${item.label}`);
                        const user = this.parseUserInfo(message); 
                        await client.commands.get(root).execute(message, item.label, analysis, user);
                    }
                }));
            }
        }catch(error){
            Logger.error(`
            Error bot-core.js | msg(${message})
            Error : ${error}
            `);
        }
    }

    parseUserInfo(message) {
        try {
            const user = { 
                userId : message.author.id, 
                username : message.author.username,  
                tag : message.author.tag
            }
            Logger.info(`Bot | parseUserInfo | user : ${JSON.stringify(user)}`); 
            return user; 
        }catch(error) {
            Logger.error(`
                Error parsing user data.
            `);
        }
    }

    async analyze(message) {
        Logger.info(message.content);
    }

    loadCommands(){
        Logger.info(`Bot | loadCommands `);
        this.client.commands = new Discord.Collection();
        const commandFiles = fs.readdirSync('./discord-bot/commands').filter(file => file.endsWith('.js')); 
        for(const file of commandFiles){
            Logger.debug(`Bot | loadCommands | file : ${file}`);
            const command = require(`../commands/${file}`); 
            this.client.commands.set(command.name, command); 
        }
    }
}

module.exports = Bot; 