const Logger = require('../utility/logger');

class CommunicationInterface {
    static async handleFailure(message, missing) {
        try {
            let response = 'I was unable to complete your request. I am missing the following parameters :';
            missing.forEach( item => {
                response += `
                ${item}`; 
            });
            await message.author.send(response); 
        }catch(error) {
            //lol ironic
            Logger.error(`CommunicationInterface | handleFailure | error : ${error}`);
        }
    }

    static async send(message, content) {
        Logger.info(`CommunicationInterface | send | content : ${JSON.stringify(content)}`);
        try {
            let queue = '';
            let iterator = 2; 
            for(var i = 0; i < content.length; i++) {
                Logger.info(`CommunicationInterface | send | for : ${content[i]}`);
                if(i != 0 && i % 2 === 0) {
                    queue += content[i]; 
                    await message.author.send(queue); 
                    queue = ''; 
                }
                queue += content[i]; 
            }
            if(queue !== '') {
                await message.author.send(queue);
            }
        }catch(error){
            Logger.error(`CommunicationInterface | send | error : ${error}`);
        }
    }
}

module.exports = CommunicationInterface; 