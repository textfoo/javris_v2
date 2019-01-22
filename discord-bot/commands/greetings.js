
module.exports = {
    name : "greeting", 
    description : "please hello greetings", 
    async execute(message, label, analysis) {
        try { 
            await message.reply(analysis[0].answer);
        }catch(error) {
            console.log(error);
        }
    }
}