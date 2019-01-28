const famousPerson = "Jimmy Carter"; 
const botName = "Jarvis"
const year = new Date().getFullYear();

const Logger = require("../../utility/logger")
const fs = require('fs'); 

module.exports = {
    name : "tutorial",
    description : "Shows a simple betting scenario. Say : 'tutorial', 'help me', or 'I'm stupid'.", 
    async execute(message, label, analysis) {
        switch(label) {
            case 'tutorial' : await tutorial(message, analysis); break;
            case 'tutorial-about' : await about(message, analysis); break;  
        }         
    
        async function tutorial(message, analysis) {
            try {
                await message.author.send(analysis[0].answer);
                let text = `Please check out the user manual : https://github.com/textfoo/javris_v2/wiki/User-Manual`; 
                await message.author.send(text); 
            }
            catch(error) {
                console.log(error);
            }
        }

        async function about(message, analysis) {
            try {
                //i know what you're thinking...
                //for whatever reason discord displays it correctly...
                await message.reply(analysis[0].answer); 
                let text = `
                I am the second iteration of a generic betting bot. 
                My primary development language is in nodejs.

                Under the hood I am powered by : 
                discord-js  :   <https://discord.js.org/>
                node-nlp    :   <https://www.npmjs.com/package/node-nlp>
                mongodb   :   <https://www.npmjs.com/package/mongodb>
                winston      :   <https://www.npmjs.com/package/winston>
                axois          :   <https://www.npmjs.com/package/axios>

                I live in github : https://github.com/textfoo/jarvis
                (you're more than welcome to make a pull request)`; 
                await message.reply(text);
            }catch(error) {
                Logger.error(`| commands | about | ${error}`);
            }
        }

    }

}