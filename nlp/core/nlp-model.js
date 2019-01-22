
const Logger = require("../../utility/logger");
const { NlpManager } = require("node-nlp");
//for dev


class NLPModel {
    constructor(docs, answers) {
        Logger.debug(`NLPModel | constructor | docs : ${docs.length}, answers : ${answers.length}`);
        this.manager = new NlpManager({ languages: ['en'] });
        this.loadDocs(docs);
        this.loadAnswers(answers); 
    }

     loadDocs(docs) {
        for(var i = 0; i < docs.length; i++) {
            this.manager.addDocument(docs[i].lang, docs[i].text, docs[i].intent); 
        }

    }

    loadAnswers(answers) {
        for(var i = 0; i < answers.length; i++) {
            this.manager.addAnswer(answers[i].lang, answers[i].intent, answers[i].text); 
        }
    }

     async train() {
        try {
            await this.manager.train();
            this.manager.save(); 
        }catch(error) {
            Logger.error(`
                Error training models.
                Error : ${error}
            `);
        }
     }

     async process(message) {
         try {
            const response = await this.manager.process('en', message); 
            //Logger.debug(`NLPModel | process | message : ${JSON.stringify(response)}`);
            if(parseFloat(response.classification[0].value) >= 0.7) {
            Logger.debug(`
                    label  : ${response.classification[0].label},
                    score  : ${response.classification[0].value},
                    answer : ${response.answer}`);
            return {
                label : response.classification[0].label, 
                score : response.classification[0].value,
                answer : response.answer
            }
        }
        return null;
         }catch(error) {
            Logger.error(`NLPModel | process | Error parsing : ${message}, 
            Error : ${error}
            `);
         }
     }

     async entities(message) {
         try {
            const response = await this.manager.extractEntities('en', message); 
            Logger.debug(`Extrated Entities : ${response}`); 
            return response; 
         }catch(error) {
            Logger.error(`NLPModel | entities | Error parsing : ${message}, 
             Error : ${error}
             `);
         }
     }
}

module.exports = NLPModel; 