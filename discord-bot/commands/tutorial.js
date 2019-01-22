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
                let text = `You're a bookmaker. 
                Your job is to create bets that are tantalizing to take action against. 
                Currently this sytem supports 'Single'-type trasactional betting. 
        
                For example, you think that ${famousPerson} might kick the bucket in ${year}. 
                So you'll contact ${botName} with the intent to open a book. 
        
                *@${message.author.username}* >> @${botName}, open a book, '${famousPerson} will kick the bucket in ${year}', odds are 4/1, 
                bet ends on 12/31/${year}.

                *@${botName}* >> I've opened the following book : 
                **Titled**  : '${famousPerson} will kick the bucket in ${year}', 
                **Odds**    : 4/1, 
                This bet automatically closes on *12/31/${year}*. 
                `; 
                await message.author.send(text); 
                text = `Now other members on your server can see what bets have been created by the bookmakers there.

                *@UserTWO* >> @${botName} show me your open books
                *@${botName} >> Kindly, I have the following 1 book(s) currently open : 
                **Book Id** : 5c3047e00000000000000000
                **Title**   : '${famousPerson} will kick the bucket in ${year}'
                **Odds**    : 4/1
                **Ends**    : 12/31/${year}

                If @UserTWO believes that ${famousPerson} will outlive the end ${year} of the bet they might wager against you...

                *@UserTWO* >> @${botName} I'd like to open a bet against '5c3047e00000000000000000' for $20. 
                *@${botName}* >> @UserTWO, I've recorded your bet against book '5c3047e00000000000000000' with a payout of $100. 
                `;
                await message.author.send(text); 

                text = `Let's fast foward a bit and say that ${famousPerson} dies. Your bet wins and you go to close out your book...
                
                *@${message.author.username}* >> @${botName} close out book '5c3047e00000000000000000'. Payout to the bookie.
                *@${botName}* >> Kindly, book '5c3047e00000000000000000' has been closed. $20 has been deposited into your wallet. 
                `; 
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