const Logger = require("../utility/logger");

class Parser {
    static parseQuotedText(text) {
        Logger.info(`Parser | parseQuotedText | text : ${text}`);
        try {
                let response = text.match(/'(.*?)'/)[0].replace(/'/g, '').trim();
                if(!response) {
                    return '';
                }
                return response;
            
        }catch(error) {
            Logger.error(`Parser | parseQuotedText | error : ${error} `);
        }
    }

    static parseParameters(analysis, expectation) {
        try {
            Logger.info(`Parser | parseParameters | analysis : ${JSON.stringify(analysis)}, expectation : ${JSON.stringify(expectation)}`);
            let response = []; 
            analysis.map(item => {
                response.push({ name : item.label, value : item.answer}); 
                let index = expectation.indexOf(item.label); 
                if(index !== -1) {
                    expectation.splice(index, 1); 
                }
            }); 
            Logger.debug(`Parser | parseParameters | response : ${JSON.stringify(response)}, expectation : ${JSON.stringify(expectation)}`);
            return {
                response, 
                missing : expectation
            }
        }catch(error) {
            Logger.error(`Parser | parseParameters | error : ${error} `);
        }
    }

    static parseTags(content) {
        try {
            Logger.info(`Parser | parseTags | parseTags : ${JSON.stringify(content)}`);
            const matches = content.match(/(#[^ ]+)/g); 
            Logger.debug(`Parser | matches : ${JSON.stringify(matches)}`);
            return matches; 
        }catch(error) {
            Logger.error(`Parser | parseTags | error : ${error} `);
        }
    }
}

module.exports = Parser;