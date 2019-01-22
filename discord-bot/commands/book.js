const Logger = require("../../utility/logger");

const Parser = require("../../utility/parser"); 
const BrokerInterface = require("../../interfaces/broker-interface"); 
const CommunicationInterface = require("../../interfaces/communication-interface");
module.exports = { 
    name : "book", 
    description : "Book related functions. Create, delete, lookup", 
    async execute(message, label, analysis, user) {
        switch(label) {
            case "book-create" : await createBook(message, analysis, user); break; 
            case "book-close"  : await closeBook(message, analysis, user);  break;
            case "book-delete" : await deleteBook(message, analysis, user); break; 
            case "book-lookup" : await lookupBook(message, analysis, user); break; 
            case "book-show"   : await fetchBooksByServer(message, analysis, user); break; 
        }


        async function createBook(message, analysis, user){
            try {
                Logger.info(`book | createBook | analysis : ${JSON.stringify(analysis)}, user : ${JSON.stringify(user)}`);
                let validation = Parser.parseParameters(analysis, [ 'book-create', 'odds' ]);
                const text = Parser.parseQuotedText(message.content);
                Logger.debug(`book | createBook | text : ${text} | validation : ${JSON.stringify(validation)}`);

                if(validation.missing.length === 0 && text && message.guild !== null) {
                    let book = { 
                        'text' : text, 
                        'open' : true,
                        'serverId' : message.guild.id,
                        'odds' : validation.response.find(item => item.name == 'odds').value,
                        'created' : Date.now(),
                        'end' : Date.parse(validation.response.find(item => item.name == 'date-end').value) || '-',
                        bets : []
                    }
                    const response = await BrokerInterface.createBook(user, book); 
                    //a response of null at this point
                    //may be indicative on mongodb connection failure
                    if(response == null) {
                        await message.channel.send(` Apologies, I was unable to create the book. Something is quite broken.`); 
                        return; 
                    }
                    /* Determine failure and user inform */
                     if(response.result.n === 1) {
                        await message.channel.send(`Book ${response.result._id} has been created.`);
                         return; 
                     }

                     if(response.result.n !== 0 ){
                         validation.missing.push("unable to locate that broker (have you 'setup' yet?)");
                     }
                }
                if(text.length === 0) {
                    validation.missing.push("text (make sure a title is 'in single quotes')"); 
                }
                if(!message.guild) {
                    validation.missing.push("channel (make sure you're creating a bet within a discord server and not direct message).");
                }
                await CommunicationInterface.handleFailure(message, validation.missing);
                return; 

            }catch(error) {
                Logger.error(`book | createBook | error : ${error}`);
            }
        }


        async function closeBook(message, analysis, user) {
            try {
                Logger.info(`book | closeBook | analysis : ${JSON.stringify(analysis)}, user : ${JSON.stringify(user)}`);
                const bookId = Parser.parseQuotedText(message.content); 
                const validation = Parser.parseParameters(analysis, [ 'payout-bettor', 'payout-broker']); 
                Logger.info(`book | closeBook | validation : ${JSON.stringify(validation)}`);
                //since we're trying to identify a situation in which the payout was either omitted or specified for a party
                //we need to route to the associated payout function on the broker interface
                let brokerPayout = missing[0]
                

            }catch(error) {
                Logger.error(`book | closeBook | error : ${error}`);
            }
        }

        async function deleteBook(message, analysis, user) {
            try {

            }catch(error){

            }
        }

        async function lookupBook(message, analysis, user) {
            try {

            }catch(error) {
                
            }
        }

        //


        async function fetchBooksByServer(message, analysis, user) {
            try {
                Logger.info(`book | fetchBooksByServer | analysis : ${JSON.stringify(analysis)}, user : ${JSON.stringify(user)}`);
                Logger.info(`book | fetchBooksByServer | guild : ${JSON.stringify(message.guild.id)}`);
                const response = await BrokerInterface.fetchBooksByServer(user, message.guild.id); 
                Logger.debug(`book | fetchBooksByServer | response : ${JSON.stringify(response)}`);
                if(response == null) {
                    await message.channel.send(` Apologies, I was unable to fetch the books on the server. Something is quite broken.`); 
                    return; 
                }

                let communication = []; 
                response.forEach( broker => {
                    Logger.debug(`book | fetchBooksByServer | response.forEach : ${JSON.stringify(broker)}`);
                    const created = new Date(broker.books.created);
                    const end = new Date(broker.books.end);
                    communication.push(`
                    *Id* : ${broker.books._id}
                    *Text* : ${broker.books.text}, 
                    *Odds* : ${broker.books.odds}, 
                    *Created* : ${created},
                    *End* : ${end}
                    `);
                });
                Logger.debug(`book | fetchBooksByServer | communication : ${JSON.stringify(communication)}`);
                await CommunicationInterface.send(message, communication); 
            }catch(error) {
                Logger.error(`book | fetchBooksByServer | error ${error}`)
            }
        }


    }
}
