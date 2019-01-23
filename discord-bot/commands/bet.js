const Logger = require("../../utility/logger"); 

const Parser = require("../../utility/parser"); 
const BrokerInterface = require("../../interfaces/broker-interface"); 
const CommunicationInterface = require("../../interfaces/communication-interface");

module.exports = { 
    name : "bet",
    description : "Bet related functions : create, lookup",
    async execute(message, label, analysis, user) {
        switch(label) {
            case "bet-create" : await createBet(message, analysis, user); break; 
            case "bet-show" : await fetchBetsByBook(message, analysis, user); break; 
            case "bet-user" : await fetchBetsByUser(message, analysis, user); break; 
        }

        async function createBet(message, analysis, user){
            try {   
                Logger.info(`bet | createBet | analysis : ${JSON.stringify(analysis)}, user : ${JSON.stringify(user)}`);
                let validation = Parser.parseParameters(analysis, [ 'bet-create', 'currency' ]); 
                let id = Parser.parseQuotedText(message.content); 
                Logger.debug(`bet | createBet | id : ${id}, validation : ${JSON.stringify(validation)}`); 
                /*
                    We're trying to narrow the scope to limit the amount of db calls that will be needed in order to execute the transaction

                */
                if(validation.missing.length === 0) {
                    const book = await BrokerInterface.fetchBookByBetId(id);
                    Logger.debug(`bet | createBet | fetchBookByBetId ${JSON.stringify(book)}`);
                    console.log(book[0].user.userId);
                    if(book[0].user.userId !== message.author.id) {
                        const balResponse = await BrokerInterface.fetchBalance(user); 
                        Logger.debug(`bet | createBet | balResponse : ${JSON.stringify(balResponse.wallet.balance)}`);
                        const bal = parseFloat(balResponse.wallet.balance); 
                        const amount = parseFloat(validation.response.find(item => item.name == 'currency').value.replace('$', ''));
                        Logger.debug(`bet | createBet | bal ${bal}, amount : ${amount}`);
                        if(bal >= amount) {
                            //it'd be best to calculate the payout now instead of having to do it when paying out a book
                            //this is gross it'd be better to move this function into another class or area
                            if(book[0].books.open === true) {
                                const odds = book[0].books.odds.split('/'); 
                                Logger.debug(`bet | createBet | odds ${odds}`);
                                const payout = BrokerInterface.calculatePayout(odds, amount);
                                Logger.debug(`bet | createBet | payout ${JSON.stringify(payout)}`);

                                const updatedBalResponse = await BrokerInterface.subtraceWallet(user, amount); 
                                Logger.debug(`bet | createBet | updatedBalResponse ${JSON.stringify(updatedBalResponse)}`);
                                if(updatedBalResponse.lastErrorObject.n === 1) {
                                    const updatedBal = (parseFloat(bal) - parseFloat(amount)).toFixed(2); 
                                    const bet = {
                                        'user' : user, 
                                        'odds' : book[0].books.odds, 
                                        'amount' : amount + 0.0, 
                                        'payout' : payout
                                    };
                                    const betResponse = await BrokerInterface.createBet(id, bet); 
                                    Logger.debug(`bet | createBet | betResponse ${JSON.stringify(betResponse)}`);
                                    await CommunicationInterface.send(message, [`_Bet Created on_ :\n${book[0].books.text} | ${id}.\nAmount : $${amount}.\nWallet Balance : $${updatedBal}.\nPayout : $${payout}.`]);
                                    return;
                                }
                            }
                            await CommunicationInterface.send(message, [`Book : ${id} is closed.`]);
                            return; 
                        }
                        await CommunicationInterface.send(message, [`Your wallet of : $${bal} has insufficent funds to place a $${amount} bet.`]);
                        return; 
                    }
                    await CommunicationInterface.send(message, [ `You cannot create a bet on your own book!`]); 
                    return; 
            }
            }catch(error) {
                Logger.error(`bet | createBet | error : ${error}`);
            }
        }

        async function fetchBetsByBook(message, analysis, user) { 
            try {
                Logger.info(`bet | showBets | analysis : ${JSON.stringify(analysis)}, user : ${JSON.stringify(user)}`);
                let id = Parser.parseQuotedText(message.content); 
                Logger.debug(`bet | showBets | id : ${id}, validation : ${JSON.stringify(validation)}`); 
                if(id.length > 0) {
                    const bets = await BrokerInterface.fetchBetsByBookId(id); 
                    
                }


            }catch(error) {
                Logger.error(`bet | showBets | error : ${error}`);
            }
        }

        async function fetchBetsByUser(message, analysis, user) {
            try {
                Logger.info(`bet | fetchBetsByUser | analysis : ${JSON.stringify(analysis)}, user : ${JSON.stringify(user)}`);
                const response = await BrokerInterface.fetchBetsByUser(user); 
                Logger.debug(`bet | fetchBetsByUser | response : ${JSON.stringify(response)}`);
                if(response.length !== 0) { 
                    let escrow = 0; 
                    let betMsg = []; 
                    response.map(x => {
                        escrow += parseFloat(x.books.bets.amount); 
                        betMsg.push(`\n${x._id}\nTitle : ${x.books.text}\nAmount : ${x.books.bets.amount}\nOdds : ${x.books.bets.odds}\n`);
                    });
                    betMsg.push(`Total in escrow : $${escrow}`);
                    await CommunicationInterface.send(message, betMsg); 
                    return; 
                }
                await CommunicationInterface.send(message, [`I could not find any bets by that user`]);
                return; 
            }catch(error) {

            }
        }

    }
}