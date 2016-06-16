var Discord = require("discord.js");

var bot = new Discord.Client({autoReconnect: true});
var fs = require('fs');
var config = require('./config.json');
var chalk = require('chalk');
var package = require('./package.json')
var name;
var version = package['version'];
var token = config["bot"]["token"];

//Returns a [MM-DD-YY HR:MIN:SEC] Timestamp for console
function getConsoleTimestamp(){
  var date = new Date();
  var minutes = date.getMinutes();
  var hours = date.getHours();
  var seconds = date.getSeconds();
  var month = parseInt(date.getMonth())+1;
  if(minutes < 10){
    minutes = "0" + minutes;
  }
  if(hours < 10){
    hours = "0" + hours;
  }
  if(seconds < 10){
    seconds = "0" + seconds;
  }

  timestamp = "[" + month + "/" + date.getDate() + "/" + date.getFullYear() + " " + hours + ":" + minutes + ":" + seconds + "]";
  return timestamp + " ";
}

function log(message, save){
  save = save || false;
  toLog = chalk.bold(getConsoleTimestamp()) + message;
  console.log(toLog);
  if(save){
    toLog = "\r\n" + toLog;
    fs.appendFileSync("output-log.txt", toLog);
    return;
  }else{
    return;
  }
}

//Logs into discord
function login(){
  log("Logging into Discord...");
  bot.loginWithToken(token, function(error, token){
    if(error != null){
      log("Could not log into Discord: " + error);
    };
  });
}

function getConsoleUser(message){
  return message.author.name + "@" + message.author.id;
}

function updateConfig(){
  fs.writeFileSync(configName, JSON.stringify(config, null, "\t"));
}

function getUserCount(){
  return bot.users.length;
}

function getServerCount(){
  return bot.servers.length;
}

var botMention = undefined;
bot.on("ready", function(){
  botMention = "<@" + bot.user.id + ">";

  var serverCount = getServerCount();
  var serverString = "Servers";
   if(serverCount == 1){
    serverString = "Server";
  }

  var userCount = getUserCount();
  var userString = "Users";
   if(userString == 1){
    userString = "User";
  }
  console.log(chalk.green("---------- CONNECTED TO DISCORD ----------"));

  name = bot.user.name;

  bot.setPlayingGame("Overwatch");

  log(name + " version " + version + " now online, serving " + serverCount + " " + serverString + " with " + userCount + " " + userString + ".", true);
});

function highNoon(channel, mention){
  mention = mention || false;
  if(!mention){
    bot.sendMessage(channel, "http://i.imgur.com/wv5Rew4.png"); 
  }else{
    bot.sendMessage(channel, mention + " http://i.imgur.com/wv5Rew4.png"); 
  }
}

var questions = ["what time is it?", "i wonder what time it could possibly be at this moment.", "do you happen to have a watch on you?", "what happens when the sun is directly above you?"];
bot.on("message", function(message){
  try{
    if(message.author.id == bot.user.id || message.channel.id == 184505472009764864){
      return;
    }else{
      var content = message.content.toLowerCase();
      if(content.indexOf("high noon") > -1){
        highNoon(message.channel);
      }
      if(content.startsWith(botMention)){
        var args = content.split(" ");
        args.shift();
        var question = args.join(" ").toLowerCase();
        if(question in questions){
          highNoon(message.channel, message.author.mention());
        }
      }
    }
  }catch(e){
    log(chalk.red("[Message Event] ERROR: ") + e);
  }
  
});

bot.on("serverCreated", function(server){
  var serverCount = getServerCount();
  var serverString = "Servers";
  if(serverCount == 1){
    serverString = "Server";
  }

  var userCount = getUserCount();
  var userString = "Users";
   if(userString == 1){
    userString = "User";
  }

  log("I've joined a new server (" + server.name + ")! Now serving " + serverCount + " " + serverString + " with " + userCount + " " + userString + ".", true);
});

bot.on("serverDeleted", function(server){
  var serverCount = getServerCount();
  var serverString = "Servers";
  if(serverCount == 1){
    serverString = "Server";
  }

  var userCount = getUserCount();
  var userString = "Users";
   if(userString == 1){
    userString = "User";
  }

  log("I've left a server (" + server.name + ") :( ... Now serving " + serverCount + " " + serverString + " with " + userCount + " " + userString + ".", true);
});

bot.on("disconnect", function(){
  log("Disconnected from Discord. Attempting to reconnect...");
  login();
});

bot.on("debug", function(error){
  log(chalk.yellow("DEBUG: ") + error);
});

bot.on("warn", function(error){
  log(chalk.orange("WARNING: ") + error, true);
});

bot.on("error", function(error){
  log(chalk.red("ERROR: ") + error, true);
  bot.logout();
  process.exit();
});

login();
