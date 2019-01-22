const fs = require('fs'); 
const NLPModel = require("../core/nlp-model"); 
const Logger = require("../../utility/logger");

class NLPModelManager {
    constructor() {
        this.models = [];
    }

    async constructModels() {
        try {
            Logger.info(`NLPModelManager | constructModels`);
            const configurations = fs.readdirSync("./nlp/models").filter(file => file.endsWith(".json")); 
            await Promise.all(configurations.map(async (file) => {
                const config = require(`../models/${file}`); 
                const model = new NLPModel(config.docs, config.answers); 
                await model.train(); 
                this.models.push(model);
            })); 
            Logger.debug(`NLPModelManager | constructModels | Models Loaded : ${this.models.length}`);
        }catch(error){ 
            Logger.error(`
            Error constructing models.
            Error : ${error}
        `);
        }
    }

    async analyze(message) {
        Logger.info(`NLPModelManager | analyze(${message})`);
        try {
            let response = []; 
            await Promise.all(this.models.map(async (model) => {
                const result = await model.process(message); 
                if(result != null) {
                    response.push(result);
                }
            })); 
            Logger.debug(`NLPModelManger | response : ${JSON.stringify(response)}`);
            return response;
        }catch(error) {
            Logger.error(`
            Error analyzing message : ${message}.
            Error : ${error}
        `);
        }
    }
}

module.exports = NLPModelManager; 