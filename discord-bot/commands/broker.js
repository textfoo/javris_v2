const Logger = require("../../utility/logger");

const Parser = require("../../utility/parser"); 
const BrokerInterface = require("../../interfaces/broker-interface");

module.exports = { 
    name : "broker", 
    description : "Broker related functions. Create, delete, lookup", 
    async execute(message, label, analysis, user) {
        switch(label) {
            case "broker-create" : await createBroker(message, analysis, user); break; 
            case "broker-delete" : await deleteBroker(message, analysis, user); break; 
            case "broker-lookup" : await lookupBroker(message, analysis, user); break; 
        }

        /*
        Creates a new broker object in the database. 

        */
        async function createBroker(message, analysis, user){
            try {
                Logger.info(`broker | createBroker`); 
                let response = await BrokerInterface.createBroker(user);
                Logger.info(`broker | createBroker | response : ${JSON.stringify(response)}`); 
                if(response == null) {
                    await message.author.send(`*${user.username}* is already a registered broker`);
                    return; 
                }
                const broker = await BrokerInterface.fetchBroker(user); 
                Logger.debug(`broker | createBroker | broker :  ${JSON.stringify(broker)}`);
                await message.author.send(`You're now a registered broker!
                *Username*   : ${broker.user.username}
                *Broker Id*     : ${broker._id}
                *Wallet Bal*  : $${broker.wallet.balance} 
                `);
            }catch(error) {
                Logger.error(`broker | createBroker | error : ${error}`);
            }
        }

        async function deleteBroker(message, analysis, user) {
            try {
                Logger.info(`broker | deleteBroker`);
                
            }catch(error){

            }
        }

        async function lookupBroker(message, analysis, user) {
            try {

            }catch(error) {

            }
        }
    }
}