var config = require("./config.json");
var api = require("./api/slack.js");
var request = require('request');

var token;
var type;
if(process.argv.length == 3){
  type = process.argv[2];
  token = config.bot.tokens[type];
} 

var bot = new api.slack(token);
var log = require('./logger.js').logger();
var mentions = require('./mentions.json');
var fs = require('fs');
var prefix;

//COMMANDS LIST
var commands = {
    help:{
      description: "Shows you this list!",
      type: "command",
      args: {
        min: 0,
        max: 0   
      },
      usage: "",
      process: (bot, message, args)=>{
                    try{
                      bot.chat.postMessage(()=>{}, message.channel, getUserMention(bot.info.getUserID()) + " Commands: \n" +  getCommandsList());
                    }catch(e){
                      log.logError("Error executing command: " + e, "Help Command");
                    }
                  }
    },
    reload:{
        description: "Restarts the bot.",
        type: "command",
        args: {
            min: 0,
            max: 0
        },
        usage: "",
        process: (bot, message, args)=>{
                    bot.chat.postMessage(()=>{
                        log.logInfo("Bot restarted by user " + message.user + "!");
                        process.exit();
                    }, message.channel, "Restarting, be back in a jiffy!");
                }
    },
    namemc:{
        description: "Gets all previous names of a specified MC name.",
        type: "command",
        args: {
            min: 1,
            max: 1
        },
        usage: "<player name>",
        process: (bot, message, args)=>{
                    getMinecraftNameHistory(args[2], (history)=>{
                        bot.chat.postMessage(()=>{}, message.channel, "Username history for " + args[2] + ":\n" + history);   
                    });
                }
    },
    names:{
        type: "alias",
        alias: "namemc"
    },
    add:{
        description: "Adds user to the list of people to be mentioned.",
        type: "command",
        args: {
            min: 1,
            max: 1
        },
        usage: "<user mention>",
        process: (bot, message, args)=>{
                    if(!args[2].startsWith("<@") || !args[2].endsWith(">")){
                        bot.chat.postMessage(()=>{return;}, message.channel, getUserMention(message.user) + " Invalid input! Please use a mention.");
                    }else{
                        mentions.users[type].push(args[2]);
                        fs.writeFile("mentions.json", JSON.stringify(mentions, null, "\t"), (error)=>{
                            if(!error){
                                bot.chat.postMessage(()=>{}, message.channel, getUserMention(message.user) + " Successfully added " + args[2] + " to the mentions list!");
                            }
                        });
                    }
                }
    },
    remove:{
        description: "Removes user from the list of people to be mentioned.",
        type: "command",
        args: {
            min: 1,
            max: 1
        },
        usage: "<user mention>",
        process: (bot, message, args)=>{
                    if(!args[2].startsWith("<@") || !args[2].endsWith(">")){
                        bot.chat.postMessage(()=>{return;}, message.channel, getUserMention(message.user) + " Invalid input! Please use a mention.");
                    }else{
                        var userIndex = mentions.users[type].indexOf(args[2]);
                        mentions.users[type].splice(userIndex,1);
                        if(userIndex >= 0){
                            fs.writeFile("mentions.json", JSON.stringify(mentions, null, "\t"), (error)=>{
                                if(!error){
                                    bot.chat.postMessage(()=>{}, message.channel, getUserMention(message.user) + " Successfully removed " + args[2] + " from the mentions list!");
                                }
                            });
                        }else{
                            bot.chat.postMessage(()=>{return;}, message.channel, getUserMention(message.user) + " User is not on the mention list!");
                        }
                    }
                }
    },
    list:{
        description: "Lists everyone in the mention list.",
        type: "command",
        args: {
            min: 0,
            max: 0
        },
        usage: "",
        process: (bot, message, args)=>{
                    var mentionString = mentions.users[type].join(", ");
                    bot.chat.postMessage(()=>{}, message.channel, getUserMention(message.user) + " Users on the mention list: " + mentionString);
                }
    }
}

//COMMAND FUNCTIONS
function getUserMention(id){
    return "<@" + id + ">";
}
function getCommandInfo(active_command){
    return {
            description: active_command.description,
            type: active_command.type,
            alias: active_command.alias,
            args: {
                min: active_command.args.min,
                max: active_command.args.max   
            },
            usage: active_command.usage
        }
    
}

function getCommandsList(){
    var list = "```\n"
    for(var command in commands){
        var active_command = commands[command];
        var command_info = getCommandInfo(active_command);
        if(command_info.type == "hidden"){
            continue;
        }else if(command_info.alias){
            active_command = commands[command_info.alias];
            command_info = commands[active_command];
            command_info.description = "Alias of " + active_command + ".";
        }
        command_info.name = command;
        list += command_info.name + ":";
        list += "\n    Description: \"" + command_info.description + "\"";
        list += "\n    Usage:       @" + bot.info.getUserName() + " " + command_info.name + command_info.usage + "\n";
    }
    list += "\n```";
    return list;
}

function getMinecraftNameHistory(username, callback){
    var history = "```"
    var username_url = "https://api.mojang.com/users/profiles/minecraft/" + username;
    bot.utils.get(username_url, (result)=>{
        var uuid = result.id;
        var uuid_url = "https://api.mojang.com/user/profiles/"+ uuid +"/names";
        bot.utils.get(uuid_url, (names)=>{
            for(var nameIndex in names){
                var name = names[nameIndex];
                if(!name.changedToAt){
                    history += "\n" + name.name + " - Original Name.";
                }else{
                    var timeChanged = new Date(name.changedToAt);
                    history += "\n" + name.name + " - Changed on " + timeChanged.toDateString();
                }
            }
            history += "\n```";
            callback(history);
        }); 
    });
}

function mentionUsers(message){
    var toMention = mentions.users[type].join(", ");
    bot.chat.postMessage(()=>{}, message.channel,  toMention + " Please read above^");
}

//SCRIPT/BOT FUNCTIONS
function runCommand(command, message, args){
    if(args.length-2 < command.args.min){
        bot.chat.postMessage(()=>{}, message.channel, getUserMention(message.user) + " not enough arguments!");
    }else if(args.length-2 > command.args.max){
        bot.chat.postMessage(()=>{}, message.channel, getUserMention(message.user) + " too many arguments!");
    }else{
        try{
            command.process(bot, message, args);
        }catch(e){
            log.logError("Error in processing the command \"" + command + "\": " + e);
            bot.chat.postMessage(()=>{}, message.channel, getUserMention(message.user) + " Unable to process command, sorry! Contact my developer for help.");
        }
    }
}

function startBot(){
    log.logInfo("Starting bot...")
    bot.auth.test((response)=>{
        if(response.ok){
            bot.rtm.start();
        }else{
            log.logError("Error starting bot: " + response.error);
        }
    });
    registerEvents();
}

function registerEvents(){
    bot.events.on('hello', ()=>{
        log.logInfo("Connected to RTM at team " + bot.info.getTeamName() + "!", "bot/Hello Event");
        prefix = "<@" + bot.info.getUserID() + ">";
    });
    bot.events.on('message', (message)=>{
        //console.log("Received a new message...");
        if(!message.subtype){
            parseMessage(message);
        }else{
            //log.logDebug("Message received with subtype " + message.subtype, "bot/Message Event");
        }    
    });
}

function parseMessage(message){
    var args = message.text.split(" ");
    if(args[0].toUpperCase().startsWith(prefix.toUpperCase())){
        if(args.length == 1){
            mentionUsers(message);
            return;
        }else{
            var command = commands[args[1]];
            if(command){
                if(command.alias){
                    command = commands[command.alias];
                }
                if(command){
                    runCommand(command, message, args);
                    return;
                }
            }else{
                bot.chat.postMessage(()=>{}, message.channel, getUserMention(message.user) + " Invalid command entered!");
                return false;
            }    
        }
    }else if(message.text.toUpperCase().indexOf(mentions.prefix + type.toUpperCase()) >= 0){
        mentionUsers(message);
        return;
    }
}

startBot();