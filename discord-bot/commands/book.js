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
            case "book-user"   : await fetchBooksByUser(message, analysis, user); break; 
            case "wallet-show" : await lookupWallet(message, analysis, user); break; 
        }


        async function createBook(message, analysis, user){
            try {
                Logger.info(`book | createBook | analysis : ${JSON.stringify(analysis)}, user : ${JSON.stringify(user)}`);
                let validation = Parser.parseParameters(analysis, [ 'book-create', 'odds' ]);
                const text = Parser.parseQuotedText(message.content);
                const tags = Parser.parseTags(message.content); 
                Logger.debug(`book | createBook | text : ${text} | tags : ${tags}, validation : ${JSON.stringify(validation)}`);
                const odds = validation.response.find(item => item.name == 'odds').value; 
                if(validation.missing.length === 0 && text && message.guild !== null && odds[0] !== '0' && odds[2]!==0) {
                    let book = { 
                        'text' : text, 
                        'open' : true,
                        'serverId' : message.guild.id,
                        'odds' : odds,
                        'created' : Date.now(),
                        'tags' : tags, 
                        bets : [],
                    }
                    console.log('creating book...'); 
                    const response = await BrokerInterface.createBook(user, book); 
                    Logger.debug(`book | createBook | response : ${JSON.stringify(response)}`);
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
                if(validation.missing.length === 1) {
                    const root = await BrokerInterface.fetchBook(user, bookId); 
                    Logger.debug(`book | closeBook | book : ${JSON.stringify(root)}`);
                    if(root.books.open === true) {
                        const bets = root.books.bets; 
                        if(validation.missing[0] === 'payout-bettor') {
                            //this implies we need to payout the broker
                            let total = 0;
                            bets.forEach((bet) => {
                                total += parseFloat(bet.amount);
                            });
                            const walletAddResponse = await BrokerInterface.addWallet(user, parseFloat(total));
                            const closeResponse = await BrokerInterface.closeBook(user, bookId); 
                            Logger.debug(`book | closeBook | walletAddResponse : ${JSON.stringify(walletAddResponse)}, closeResponse : ${JSON.stringify(closeResponse)}`);
                            if(walletAddResponse.lastErrorObject.updatedExisting === true && closeResponse.result.nModified === 1) {
                                await CommunicationInterface.send(message, [`Book '${bookId}' has been closed. $${total} has been deposited into your wallet.`]);
                                return; 
                            }
                        }
                        if(validation.missing[0] === 'payout-broker') {
                            //this implies we need to payout folks who placed bets
                            const batchResponse = await BrokerInterface.addWalletBatch(bets); 
                            const closeResponse = await BrokerInterface.closeBook(user, bookId); 
                            Logger.debug(`book | closeBook | addWalletBatch : ${JSON.stringify(batchResponse)}, closeResponse : ${JSON.stringify(closeResponse)}`);
                            await CommunicationInterface.send(message, [`A total of ${parseFloat(batchResponse.total).toFixed(2)} has been deposited into ${batchResponse.users} wallets.`]);
                            return; 
                        }
                    }
                    await CommunicationInterface.send(message, [`Book '${bookId} has already been closed.'`]);
                    return; 
                }
                await CommunicationInterface.send(message, [`Please specify payout : 'payout bettor' or 'payout broker'.`]);
                return; 
                

            }catch(error) {
                Logger.error(`book | closeBook | error : ${error}`);
            }
        }

        async function fetchBooksByServer(message, analysis, user) {
            try {
                Logger.info(`book | fetchBooksByServer | analysis : ${JSON.stringify(analysis)}, user : ${JSON.stringify(user)}, guild : ${JSON.stringify(message.guild.id)}`);
                const tags = Parser.parseTags(message.content); 
                let response; 
                if(tags.length === 0) { 
                     response = await BrokerInterface.fetchBooksByServer(user, message.guild.id); 
                }else if(tags.length > 0) {
                    response = await BrokerInterface.fetchBooksByServerTags(user, message.guild.id, tags); 
                }
                Logger.debug(`book | fetchBooksByServer | response : ${JSON.stringify(response)}`);
                if(response == null | response.length === 0) {
                    await CommunicationInterface.send(message, [`No books returned.`]); 
                    return; 
                }

                let communication = []; 
                response.forEach( broker => {
                    Logger.debug(`book | fetchBooksByServer | response.forEach : ${JSON.stringify(broker)}`);
                    const created = new Date(broker.books.created);
                    const end = new Date(broker.books.end);
                    communication.push(`\n------------------\n*Id* : ${broker.books._id},\n*Text* : ${broker.books.text},\n*Odds* : ${broker.books.odds},\n*Created* : ${created}\n*End* : ${end}\n------------------------------`);
                });
                Logger.debug(`book | fetchBooksByServer | communication : ${JSON.stringify(communication)}`);
                await CommunicationInterface.send(message, communication); 
            }catch(error) {
                Logger.error(`book | fetchBooksByServer | error ${error}`)
            }
        }

        async function fetchBooksByUser(message, analysis, user) {
            try {
                Logger.info(`book | fetchBooksByUser | analysis : ${JSON.stringify(analysis)}, user : ${JSON.stringify(user)}`);
                const response = await BrokerInterface.fetchBooksByUserId(user); 
                Logger.info(`book | fetchBooksByUser | response : ${JSON.stringify(response)}`);
                if(response.length !== 0) {
                    let bookMsg = []; 
                    response.map(book => {
                        bookMsg.push(`
                            ${book.books._id}
                            *Text* : ${book.books.text}
                            *Odds* : ${book.books.odds}
                            *Bets* : ${book.bets}
                            *Created* : ${new Date(book.books.created)}
                        `);
                    });
                    await CommunicationInterface.send(message, bookMsg); 
                    return;
                }
                await CommunicationInterface.send(message, [`We don't have any books on record for that Discord User.`]);
                return; 

            }catch(error) {
                Logger.error(`book | fetchBooksByUser | error ${error}`);
            }
        }

        async function lookupWallet(message, analysis, user) {
            try {
                Logger.info(`book | lookupWallet | analysis : ${JSON.stringify(analysis)}, user : ${JSON.stringify(user)}`);
                const response = await BrokerInterface.fetchBalance(user); 
                Logger.info(`book | fetchBalance | response : ${JSON.stringify(response)}`);
                if(response !== null) {
                    const balance = 
                }
            }catch(error) {
                Logger.error(`book | lookupWallet | error ${error}`);
            }
        }
    }
}
