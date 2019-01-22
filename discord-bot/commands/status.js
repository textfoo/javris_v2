const Logger = require("../../utility/logger");

module.exports = { 
    name : "status",
    description : "Displays ",
    async execute(message, label, analysis, user) {
        switch(label) {
            case "bet-create" : await createImageBitmap(message, analysis, user); break; 
        }

        
    }
}