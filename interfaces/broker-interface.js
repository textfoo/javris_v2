const { ObjectId } = require('mongodb'); 
const MongoClient = require('mongodb').MongoClient; 
const { connectionString, log } = require('../config/db-config.json'); 

const Logger = require('../utility/logger');

let db = null; 
let collection = null; 

MongoClient.connect(connectionString, { useNewUrlParser : true}, (err, client) => {
    if(err) { Logger.error(error); return; };
    db = client.db('jarvis'); 
    collection = db.collection('brokers'); 
}); 

class BrokerInterface {
    static async exists(user) {
        try {
            Logger.info(`BrokerInterface | exists | user ${user}`); 
            let response = await collection.findOne(
             { "user.userId" : user.userId }, 
             { fields : { _id : 1 }}
            );
            Logger.debug(`BrokerInterface | exists | response : ${JSON.stringify(response)}`);
            if(response == null) {
                return false; 
            }
            return true; 
        }catch(error) {
            Logger.error(`BrokerInterface | exists | error : ${error}`);
        }
    }

    static async createBroker(user) { 
        try {
            Logger.info(`BrokerInterface | createBroker | ${user}`);
            const exists = await this.exists(user);
            if(!exists) {
                let response = await collection.insertOne(
                    { 'user' : user, 'wallet' : { balance : parseFloat(3000) }, 'books' : [] }
                );
                Logger.debug(`BrokerInterface | createBroker | response : ${response}`); 
                return response; 
            }
            Logger.debug(`BrokerInterface | createBroker | response : null (user already exists)`); 
            return; 
        }catch(error) {
            Logger.error(`BrokerInterface | createBroker | error : ${error}`); 

        }
    }

    static async fetchBroker(user) {
        try {
            Logger.info(`BrokerInterface | fetchBroker | user : ${user}`); 
            const response = await collection.findOne(
                { 'user.userId' : user.userId }
            );
            return response; 
        }
        catch(error) {
            Logger.error(`BrokerInterface | fetchBroker | error : ${error}`); 
        }
    }

    /* Book Related Functionality */
    //create, close, fetch

    static async createBook(user, book) {
        try {
            Logger.info(`BrokerInterface | createBook | user : ${JSON.stringify(user)}, book : ${JSON.stringify(book)}`);
            const id = new ObjectId(); 
            book._id = id; 
            let response = await collection.updateOne(
                { 'user.userId' : user.userId },
                { $push : { 'books' : book }}
            );
            Logger.debug(`BrokerInterface | createBook | response : ${response}`);
            response.result._id = id; 
            return response; 
        }catch(error) {
            Logger.error(`BrokerInterface | createBook | error : ${error}`); 
        }
    }

    //incomplete
    static async closeBook(user, bookId){
        try {
            Logger.info(`BrokerInterface | closeBook | user : ${user}, bookId : ${bookId}`); 
            var response = await collection.updateOne(
                { 'user.userId' : user.userId, 'books._id' : ObjectId(bookId) },
                { $set : { 'books.$.open' : false }}
            );
            Logger.debug(`BrokerInterface | closeBook | response : ${JSON.stringify(response)}`); 
            return response;
        }catch(error) {
            Logger.error(`BrokerInterface | closeBook | error : ${error}`); 
        }
    }

    static async fetchBook(user, bookId) {
        try {
            Logger.info(`BrokerInterface | fetchBook | user : ${JSON.stringify(user)}, bookId : ${bookId}`); 
            const response = await collection.aggregate([
                { $match : { 'user.userId' : user.userId}},
                { $unwind : '$books' },
                { $match : { 'books._id' : ObjectId(bookId) }},
                { $project : { 'books' : 1}}
            ]).toArray();
            Logger.debug(`BrokerInterface | fetchBook | response : ${response}`);
            return response[0]; 
        }catch(error) {
            Logger.error(`BrokerInterface | fetchBook | error : ${error}`); 
        }
    }

    static async fetchBooksByServer(user, serverId) {
        try { 
            Logger.info(`BrokerInterface | fetchBooksByServer | user : ${user}, serverId : ${serverId}`);
            let response = await collection.aggregate([
                { $match : { 'books.serverId' : serverId  }},
                { $project : { 'books' : 1 }},
                { $unwind : '$books' },
                { $match : { 'books.open' : true, 'books.serverId' : serverId }}
             ]).toArray();
             Logger.debug(`BrokerInterface | fetchBooksByServer | response : ${response}`);
             return response;
        }catch(error) {
            Logger.error(`BrokerInterface | fetchBooksByServer | error : ${error}`); 
        }
    }

    static async fetchBooksByServerTags(user, serverId, tags) {
        try { 
            Logger.info(`BrokerInterface | fetchBooksByServerTags | user : ${user}, serverId : ${serverId}, tags : ${tags}`);
            let response = await collection.aggregate([
                { $match : { 'books.serverId' : serverId  }},
                { $project : { 'books' : 1 }},
                { $unwind : '$books' },
                { $match : { 'books.open' : true}},
                { $match : { 'books.tags' : { $in : tags }}}
             ]).toArray();
             Logger.debug(`BrokerInterface | fetchBooksByServerTags | response : ${response}`);
             return response;
        }catch(error) {
            Logger.error(`BrokerInterface | fetchBooksByServerTags | error : ${error}`); 
        }
    }

    static async createBet(bookId, bet) {
        try {
            Logger.info(`book | createBet | bookId : ${bookId}, bookId : ${JSON.stringify(bet)}`);
            const response = await collection.updateOne(
                { 'books._id' : ObjectId(bookId) }, 
                { $push : { 'books.$.bets' : bet }}
            );
            Logger.info(`book | createBet | response : ${JSON.stringify(response)}`);
            return response; 
        }catch(error){ 
            Logger.error(`BrokerInterface | createBet | error : ${error}`); 
        }
    }

    static async fetchBookByBetId(betId) {
        try{
            Logger.info(`book | fetchBookByBetId | betId : ${JSON.stringify(betId)}`);
            const response = await collection.aggregate([
                { $unwind : '$books' },
                { $match : { 'books._id' :  ObjectId(betId)}}, 
                { $project : { 'user.userId' : 1, 'books.text' : 1, 'books.open' : 1, 'books.odds' : 1 }}
            ]).toArray();
            Logger.debug(`BrokerInterface | fetchBookByBetId | response : ${response}`);
            return response; 
        }catch(error) {
            Logger.error(`BrokerInterface | fetchBookByBetId | error : ${error}`); 
        }
    }

    static async fetchBooksByUserId(user) { 
        try {
            Logger.info(`book | fetchBooksByUserId | user : ${JSON.stringify(user)}`);
            const response = await collection.aggregate([
                { $match : { 'user.userId' : user.userId }}, 
                { $unwind : '$books' }, 
                { $match : { 'books.open' : true }},
                { $project : { 
                    'books._id' : 1, 'books.text' : 1, 'books.odds' : 1, 'books.created' : 1, 
                    bets : { $size : '$books.bets' }
                     }}
            ]).toArray();
            Logger.info(`BrokerInterface | fetchBooksByUserId | response : ${JSON.stringify(response)}`);
            return response; 
        }catch(error) {
            Logger.error(`BrokerInterface | fetchBooksByUserId | error : ${error}`); 
        }
    }

    static async fetchBetsByBookId(bookId) {
        try {
            Logger.info(`BrokerInterface | fetchBetsByBookId | bookId : ${bookId}`);
            const response = await collection.aggregate([
                { $unwind :  '$books' },
                { $match : { 'books._id' : ObjectId(bookId) }}, 
                { $unwind : '$books.bets' },
                { $project : { 'books.bets' : 1  }}
            ]).toArray();
            Logger.debug(`BrokerInterface | fetchBetsByBookId | response : ${JSON.stringify(response)}`);
            return response;
        }catch(error) {
            Logger.error(`BrokerInterface | fetchBetsByBookId | error : ${error}`); 
        }
    }

    static async fetchBookOwnerByBetId(bookId) {
        try {
            Logger.info(`BrokerInterface | fetchBookOwnerByBetId | bookId : ${bookId}`);
            const response = await collection.findOne(

            );
            Logger.debug(`BrokerInterface | fetchBookOwnerByBetId | response : ${response}`);
        }catch(error) {
            Logger.error(`BrokerInterface | fetchBookOwnerByBetId | error : ${error}`); 
        }
    }

    

    static async fetchBetsByUser(user) {
        try {
            Logger.info(`BrokerInterface | fetchBetsByUser | user : ${user}`);
            const response = await collection.aggregate([
                { $unwind : '$books' }, 
                { $project : { 'books.text' : 1, 'books.bets' : 1 }}, 
                { $unwind : '$books.bets' }, 
                { $match : { 'books.bets.user.userId' : user.userId }}
            ]).toArray();
            Logger.debug(`BrokerInterface | fetchBetsByUser | response : ${JSON.stringify(response)}`);
            return response; 
        }catch(error) {
            Logger.error(`BrokerInterface | fetchBetsByUser | error : ${error}`); 
        }
    }

    static async fetchBalance(user) {
        try {
            Logger.info(`BrokerInterface | fetchBalance | user : ${JSON.stringify(user)}`); 
            let response = await collection.findOne( 
                { 'user.userId' : user.userId },
                { fields : { "wallet" : 1 }}
                );
            Logger.debug(`BrokerInterface | fetchBalance | response : ${JSON.stringify(response)}`);
            return response;
        }catch(error) {
            Logger.error(`BrokerInterface | fetchBalance | error : ${error}`);
        }
    }

    static async addWallet(user, amount) {
        try {
            Logger.info(`BrokerInterface | addWallet | user : ${JSON.stringify(user)}, amount : ${amount}`); 
            const bal = await this.fetchBalance(user); 
            Logger.debug(`BrokerInterface | addWallet | bal : ${JSON.stringify(bal)}`); 
            const updated = parseFloat(bal.wallet.balance) + parseFloat(amount); 
            let response = await collection.findOneAndUpdate(
                { 'user.userId' : user.userId }, 
                { $set : {'wallet.balance' : parseFloat(updated) }}, 
                { projection: { wallet : 1  }}
            );
            Logger.debug(`BrokerInterface | addWallet | response : ${JSON.stringify(response)}`);
            return response; 
        }catch(error) {
            Logger.error(`BrokerInterface | addWallet | error : ${error}`); 
        }
    }

    static async addWalletBatch(bets) {
        try {
            Logger.info(`BrokerInterface | addWalletBatch | bets : ${JSON.stringify(bets)}`); 
            let total = 0; 
            let users = 0; 
            await Promise.all(bets.map(async (bet) => {
                total += parseFloat(bet.payout);
                users++;  
                await this.addWallet(bet.user, parseFloat(bet.payout)); 
            }));
            return { 'users' : users, 'total' : total}; 
        }catch(error) {
            Logger.error(`BrokerInterface | addWalletBatch | error : ${error}`); 
        }
    }

    static async subtraceWallet(user, amount) {
        try {
            return this.addWallet(user, parseFloat(amount * -1)); 
        }catch(error) {
            Logger.debug(`BrokerInterface | subtraceWallet | error : ${error}`);
        }
    }

    static calculatePayout(odds, input) {
        try {
            Logger.info(`BrokerInterface | calculatePayout | odds : ${odds}, input : ${input}`);
            //(( input / under )  * over )) + input
            if(odds.length == 2){
                const over = parseFloat(odds[0]);
                const under = parseFloat(odds[1]);  
                const bet = parseFloat(input); 

                const amount = ((((input / under )) * over) + bet).toFixed(2); 
                Logger.debug(`BrokerInterface | calculatePayout | amount : ${amount}`);
                return amount; 
            }
        }catch(error) {
            Logger.debug(`BrokerInterface | calculatePayout | error : ${error}`);
        }
    }
}

module.exports = BrokerInterface;