
## Local Dev Setup     
**Assumes you're starting with nothing**    
*prerequisites*    
 -[Install NodeJS](https://nodejs.org/en/) *//Current Version 10.15.0 LTS*    
 -[Install npm](https://docs.npmjs.com/cli/install)    
 -[Install git](https://git-scm.com/downloads)    
 -[Install Kraken](https://app.gitkraken.com) *(Optional)*   
 -[Install MongoDB](https://www.mongodb.com/download-center/community) *Optional - start mongodb as a service*        
 -[Install an IDE](https://code.visualstudio.com)    
 -[Install Discord](https://discordapp.com/download) *(Optional)* 
###### Internal Resources   
 [Kraken Kanban](https://app.gitkraken.com/glo/board/XEpW1ZJoLwAPIu7A)    
 [Developer Discord](https://discord.gg/Ue8XBb7)    
 ### Setup Instructions    
 *Download and install the necessary items listed in the prerequisite portion above*    
 ##### Clone the Repo
 Create an empty folder somewhere to clone the repo in. 
 ex. *C:/github/*
 ```
 //navigate into the desired directory
 >cd C:/github/
 //clone back the repo 
 //this will create 
 C:/github>git clone https://github.com/textfoo/javris_v2.git
 
 //navigate into the top level of the project
 C:/github>cd jarvis_v2
 
 //restore dependencies 
 C:/github/jarvis_v2>npm install
 //after the command is ran you should see something along the lines of
 added [x] packages from [x] contributors and audited [x] packages in 5.376s 
 ```
  #### Setup Discord for Devlopment
  Create an [bot/application](https://discordapp.com/developers/applications).    
  Copy down the **Client ID** and **Client Secret**    
  
  ##### Connecting your application to the network
  You can either set a private Discord Guild/Server     
  **OR**      
  Join the [Developer Discord](https://discord.gg/Ue8XBb7), you will require the developer role in order to invite the new bot.   
  
  **Subtitute your client id in the url below**
  Navigate to : https://discordapp.com/oauth2/authorize?client_id=CLIENT_ID_GOES_HERE&scope=bot&permissions=0     
  *Add a bot to a server* > *Select a server* > discord-bot-dev | whatever-server-you-created    
  
  ##### Setup Project Config for Development
  Navigate to the config folder within the project's directory. ex. *C:/github/jarvis_v2/config/config.json*    
  ```
  {
  "version": "1.0",
  "prefix": "@",
  "client-id": [CLIENT-ID-GOES-HERE],
  "client-secret": [CLIENT-SECRETE-GOES-HJERE],
  "token": "",
  "permissions" : 8,
  "twitchId" : "", 
  "twitchSecret" : "",
  "twitchRedirect" : "http://localhost/",
  "twitch-oauth" : "oauth:", 
  "log" : true
  }
  ```
  Navigate to the config folder within the project's directory. ex. *C:/github/jarvis_v2/config/config.json*   
  You'll need to modify your [connection string](https://docs.mongodb.com/manual/reference/connection-string/)    
  ```
  {
    "connectionString" : "mongodb://localhost:27017/admin?readPreference=primary",
    "log" : true
  }
  ```
  
  ## Running Instructions     
  [Nodemon](https://nodemon.io/) is installed for automatic reloading.  
  ##### Visual Studio Code:    
   -Start up Visual Studio Code. 
    -*File -> Open Folder* -> C:/github/jarvis_v2*
    -*Terminal -> New Terminal*
     - Run Command :    
     ```npm run dev```           
     ```info Bot Status - Ready : {     client-id   : 000000000000, username : dev, is-bot : true  }```
  
  
