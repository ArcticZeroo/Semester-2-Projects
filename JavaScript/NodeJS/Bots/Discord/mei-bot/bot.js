var Discord = require("discord.js");

var bot = new Discord.Client({autoReconnect: true});
var fs = require('fs');
var chalk = require('chalk');
var now = require('performance-now');
var request = require('request');

var configName = "config-normal.json";
if(process.argv.length >= 3){
  if(process.argv[2] == "debug" || process.argv[2] == "develop"){
    configName = "config-develop.json";
    log(chalk.cyan("Starting bot in debug mode"));
    console.log("");
  }
} 

var config = require('./' + configName);
var package = require('./package.json')
var name;
var version = package['version'];
var token = config["bot"]["token"];
var keys = config["bot"]["keys"];
var nickname = config["bot"]["nickname"];
var defaultGame;
var channels = config['channels'];
var users = [];
var madeByBot = false;

// Setting up a command:
//  Basics:
//    Unless the command is hidden, you need
//    a description.
//
//    If the type is "hidden" or "alias", it
//    won't show up in the commands list.
//
//  Arguments:
//    @BotName command argument1 argument2
//    args[0]  args[1] [args2]   args[3]
//
//    min_args and max_args begin at args[1],
//    in the above example, if you want only
//    '@BotName command' as the argument,
//    both min_args and max_args should be 1.
//
//  Permissions:
//    All commands MUST have a permission
//    level, or they won't work at all. All
//    permission numbers may be referenced
//    in config.json. Permissions are
//    only number-basd and are inherited.
//
//  Action:
//    All commands MUST have a process to
//    run, or they won't work at all. Its
//    process function must take only the
//    arguments (bot, message, args).
//
//  Usage:
//    The usage will show up in the help
//    list. @<botmention> <command> will
//    be added automatically to the usage.
//    Include a usage even if the command
//    requires no additional arguments;
//    set it to "" in that case.
//
//  Alias Commands:
//    Alias command setup is much simpler
//    than the others. The only parameters
//    required are type (which should always
//    be "alias"), and "alias", which should
//    be set to the name of the command it
//    is an alias of.
//
//  NOTES:
//    -The content of ALL commands, no
//     matter what they are, must be inside
//     try/except loops to reduce the risk
//     of the bot spontaneously crashing.
//    -It's possible that sub-commands may
//     be possibly simply by putting a
//     space in the command name, but I
//     haven't experimented with that yet.

var commands = {
    "help":{
      "description": "Shows you this list! If the second argument is 'alias' it will display aliases.",
      "type": "command",
      "permission_level": 0,
      "min_args": 1,
      "max_args": 2,
      "usage": "[alias]",
      "process": function(bot, message, args){
                    try{
                      var commandsList = getCommandsList(message);
                      bot.sendMessage(message.author, botMention + " commands:\n" + commandsList, function(error, message){
                        if(error){
                          logCommandError(error, "Help Command");
                        }                 
                      });
                    }catch(e){
                      logCommandError(e, "Creator Command", message);
                    }
                  }
    },
    "commands":{
      "type": "alias",
      "alias": "help"
    },
    "creator":{
      "description": "Gets creator of a voice channel.",
      "type": "command",
      "permission_level": 10,
      "min_args": 2, //
      "max_args": 2,
      "usage": "[channel name]",
      "process": function(bot, message, args){
                  try{
                    channel = args[2];
                    if(channel in channels[message.channel.server.id]){
                      var creator = channels[message.channel.server.id][args[3]]["creator"];
                      if(creator != "none"){
                          bot.sendMessage(message.author, channel + "'s creator is " + channels[message.channel.server.id][channel]["creator"]);
                      }else{
                        bot.sendMessage(message.author, channel + "'s creator is unknown, sorry :(")
                      }
                    }else{
                      bot.sendMessage(message.author, channel + " does not exist or cannot be found!");
                    }
                  }catch(e){
                    logCommandError(e, "Creator Command", message);
                  }
                }
    },
    "restart":{
      "description": "Logs out & restarts the bot.",
      "type": "command",
      "permission_level": 13,
      "min_args": 1,
      "max_args": 1,
      "usage": "",
      "process": function(bot, message, args){
                    try{
                      log(getConsoleUser(message) + " Restarted the bot!", true);
                      //bot.setPlayingGame("Restarting...")
                      bot.sendMessage(message.channel, "I'm restarting, be back in a jiffy!", function(error){
                        bot.logout();
                        process.exit();
                      });
                    }catch(e){
                      logCommandError(e, "Restart Command", message);
                    }
                  }
    },
    "reload":{
      "type": "alias",
      "alias": "restart"
    },
    "tempchannel":{
      "description": "Creates a temporary channel that deletes itself after 30 seconds if nobody joins or when everyone leaves.",
      "type": "command",
      "permission_level": 0,
      "min_args": 2,
      "max_args": 20,
      "usage": "[channel-name]",
      "process": function(bot, message, args){
                  try{
                    //var channelName = args[2];
                    var channelName = args.splice(2,args.length-1).join(" ");
                    if(users.indexOf(message.author.mention()) > -1){
                      bot.sendMessage(message.channel, message.author.mention() + " You already have an active channel!");
                    }else if(channelName.length <= 95 && channelName.length >= 2){
                      if(channelName in channels[message.channel.server.id] || message.channel.server.channels.get("name", channelName) != null){
                        bot.sendMessage(message.channel, message.author.mention() + " That channel already exists! Please choose another name.");
                      }else{
                        madeByBot = true;
                        bot.createChannel(message.channel.server, channelName, "voice", function(error, channel){
                          if(error == null){
                            log(getConsoleUser(message) + " created temporary channel " + channelName + " at the request of " + message.author.name + "@" + message.author.id + ".", true);
                            channels[message.channel.server.id][channelName] = {
                              "type": "temp",
                              "activated": false,
                              "creator": message.author
                            }

                            //Adds user to list of active users
                            users.push(message.author.mention());

                            if(message.author.voiceChannel == null){
                              bot.sendMessage(message.channel, message.author.mention() + " Temporary channel created successfully. Please join in 30 seconds or it will be deleted.");
                              setTimeout(function(){
                                          verifyTemp(channel);
                                        }, 30000);
                            }else{
                              channels[message.channel.server.id][channelName]["activated"] = true;
                              bot.sendMessage(message.channel, message.author.mention() + " Temporary channel created successfully. Enjoy!");
                              bot.moveMember(message.author, channel);
                            }
                          }else{
                            bot.sendMessage(message.channel, message.author.mention() + " Unable to create channel, please try again later :(");
                            logCommandError(error, "TempChannel Command", message);
                          }
                        });
                      }
                    }
                  }catch(e){
                    logCommandError(e, "Tempchannel Command", message);
                  }
                }
    },
    "temp":{
      "type": "alias",
      "alias": "tempchannel"
    },
    "disconnect":{
      "description": "Disconnects/logs out the bot. The bot will not restart.",
      "type": "hidden",
      "permission_level": 13,
      "min_args": 1,
      "max_args": 1,
      "usage": "",
      "process": function(bot, message, args){
                    try{
                      bot.sendMessage(message.channel, message.author.mention() + " has asked me to log out :(... goodbye!", function(error){
                        log("Bot has logged out.", true);
                        bot.logout();
                      });
                    }catch(e){
                      logCommandError(e, "Disconnect Command", message);
                    }
                 }
    },
    "logout":{
      "type": "alias",
      "alias": "disconnect"
    },
    "leave":{
      "description": "Makes the bot leave the current server.",
      "type": "hidden",
      "permission_level": 13,
      "min_args": 1,
      "max_args": 1,
      "usage": "",
      "process": function(bot, message, args){
                    try{
                      bot.sendMessage(message.channel, message.author.mention() + " has asked me leave the server, goodbye!", function(error){
                        bot.leaveServer(message.channel.server);
                        logDebug("Left server" + message.channel.server.name + "at the request of" + message.author.name + ".", true);
                      });
                    }catch(e){
                      logCommandError(e, "Leave Command", message);
                    }
                 }
    },
    "setgame":{
      "min_args": 2,
      "max_args": 10,
      "permission_level": 13,
      "description": "Sets the bot's game.",
      "type": "command",
      "usage": "[game]",
      "process": function(bot, message, args){
                    try{
                      var gameToSet = args.splice(2,args.length-1).join(" ");
                      bot.setPlayingGame(gameToSet, function(error){
                        if(!error){
                          bot.sendMessage(message.channel, message.author.mention() + " Successfully set game to " + gameToSet);
                        }
                      });
                    }catch(e){
                      logCommandError(e, "SetGame Command", message);
                    }
                  }
    },
    "resetgame":{
      "min_args": 1,
      "max_args": 1,
      "permission_level": 13,
      "description": "Sets the bot's game.",
      "type": "command",
      "usage": "",
      "process": function(bot, message, args){
                    try{
                      setDefaultGame();
                      bot.sendMessage(message.channel, message.author.mention() + " Successfully reset game!");
                    }catch(e){
                      logCommandError(e, "ResetGame Command", message);
                    }
                  }
    },
    "purge":{
      "min_args": 1,
      "max_args": 1,
      "permission_level": 13,
      "description": "Purges temporary channels.",
      "type": "debug",
      "usage": "",
      "process": function(bot, message, args){
                  try{
                    purgeChannels(message.channel.server);  
                  }catch(e){
                    logCommandError(e, "Purge Command", message);
                  }
                }
    },
    "botmention":{
      "min_args": 1,
      "max_args": 1,
      "description": "Returns a string which you can paste in the chat to mention the bot.",
      "permission_level": 0,
      "type": "debug",
      "usage": "",
      "process": function(bot, message, args){
                  try{
                    bot.sendMessage(message.channel, "My botMention is ```\n"+botMention+"\n```");  
                  }catch(e){
                    logCommandError(e, "BotMention Command", message);
                  }
                }
    },
    "printchannels":{
      "min_args": 1,
      "max_args": 1,
      "description": "Prints the channels array.",
      "permission_level": 13,
      "type": "debug",
      "usage": "",
      "process": function(bot, message, args){
                    try{
                      printChannels();
                    }catch(e){
                      logCommandError(e, "PrintChannels Command", message);
                    }
                  }
    },
    "getroleid":{
      "min_args": 2,
      "max_args": 2,
      "permission_level": 13,
      "description": "Logs the ID of a specified role.",
      "type": "debug",
      "usage": "[role]",
      "process": function(bot, message, args){
                    try{
                      log(message.channel.server.roles.get("name", args[2]).id);
                    }catch(e){
                      logCommandError(e, "GetRoleID Command", message);
                    }
                  }
    },
    "getchannelid":{
      "min_args": 2,
      "max_args": 2,
      "permission_level": 13,
      "description": "Messages the sender's channel the ID of a specified channel.",
      "type": "debug",
      "usage": "[channel]",
      "process": function(bot, message, args){
                    try{
                      bot.sendMessage(message.channel, args[2] + "'s channel ID is `" + message.channel.server.channels.get("name", args[2]).id + "`");
                    }catch(e){
                      logCommandError(e, "GetChannelID Command", message);
                    }
                  }
    },
    "delete":{
      "min_args": 2,
      "max_args": 2,
      "permission_level": 13,
      "type": "hidden",
      "description": "Deletes a channel. Dangerous, breaks stuff.",
      "usage": "[channel]",
      "process": function(bot, message, args){
                    try{
                      var toDelete = args[2];
                      if(toDelete in channels[message.channel.server.id]){
                          channelToDelete = message.channel.server.channels.get("name", toDelete);
                          bot.deleteChannel(channelToDelete, function(error){
                            if(error == null){
                              log("Successfully deleted channel " + toDelete + " at the request of " + message.author.name, true);
                            }else{
                              log("Unable to delete the channel " + toDelete + ": " + error);
                            }
                          });
                      }
                    }catch(e){
                      logCommandError(e, "Delete Command", message);
                    }
                  }
    },
    "updateconfig":{
      "min_args": 1,
      "max_args": 1,
      "description": "Updates the config.",
      "permission_level": 0,
      "type": "debug",
      "usage": "",
      "process": function(bot, message, args){
                  try{
                    updateConfig();
                  }catch(e){
                    logCommandError(e, "UpdateConfig Command", message);
                  }
                }
    },
    "nickname":{
      "min_args": 2,
      "max_args": 2,
      "description": "Sets the nickname of the bot.",
      "permission_level": 13,
      "type": "command",
      "usage": "[new nickname (1 word)]",
      "process": function(bot, message, args){
                  try{
                    nickname = args[2];
                    updateConfig();
                    setNickname();
                    bot.sendMessage(message.channel, "Set nickname to " + nickname);
                  }catch(e){
                    logCommandError(e, "Nickname Command", message);
                  }
                }
    },
    "ping":{
      "min_args": 1,
      "max_args": 1,
      "description": "Pings the bot.",
      "usage": "",
      "delete": false,
      "permission_level": 0,
      "process": function(bot, message, args){
                  try{
                    bot.sendMessage(message.channel, "Pong!");
                    //consolePing();
                  }catch(e){
                    logCommandError(e, "Ping Command", message);
                  }
                  
                }
    },
    "username":{
      "min_args": 2,
      "max_args": 2,
      "description": "Sets the username of the bot.",
      "permission_level": 13,
      "type": "command",
      "usage": "<new username (1 word)>",
      "process": function(bot, message, args){
                  try{
                    bot.setUsername(args[2]);
                    bot.sendMessage(message.channel, "Set username to " + args[2]);
                  }catch(e){
                    logCommandError(e, "Username Command", message);
                  }
                }
    },
    "getusers":{
      "min_args": 1,
      "max_args": 1,
      "description": "Gets the users array (users with a currently active temp channel).",
      "permission_level": 13,
      "type": "debug",
      "usage": "",
      "process": function(bot, message, args){
                  try{
                      logDebug(users);
                    }catch(e){
                      logCommandError(e, "GetUsers Command", message);
                    }
                }
    },
    "getserverid":{
      "min_args": 1,
      "max_args": 1,
      "description": "Gets id of the current server.",
      "permission_level": 10,
      "type": "debug",
      "usage": "",
      "process": function(bot, message, args){
                  try{
                    bot.sendMessage(message.channel, "`" + message.channel.server.id + "`");
                  }catch(e){
                    logCommandError(e, "GetServerID Command", message);
                  }
                }
    },
    "getperms":{
      "min_args": 2,
      "max_args": 2,
      "description": "Gets permissions level of a specific user.",
      "permission_level": 10,
      "type": "debug",
      "usage": "",
      "process": function(bot, message, args){
                  try{
                    if(message.mentions.length == 2){
                      var userPerms = getUserPermissionLevel(message.channel.server, message.mentions[1]);
                      bot.sendMessage(message.channel, "`" + message.mentions[1].name + "`'s Permission Level is `" + userPerms + "`."); 
                    }
                  }catch(e){
                    logCommandError(e, "GetPerms Command", message);
                  }
                }
    },
    "getuserperms":{
      "type": "alias",
      "alias": "getperms"
    },
    "getcommandperms":{
      "min_args": 2,
      "max_args": 2,
      "description": "Gets permissions level required to run a specific command.",
      "permission_level": 10,
      "type": "debug",
      "usage": "",
      "process": function(bot, message, args){
                  try{
                    var command_name = args[2];
                    if(isCommand(command_name)){
                      if(command_name.charAt(command_name.length-1).toLowerCase() != "s"){
                        bot.sendMessage(message.channel, "`" + command_name + "`'s Required Permission Level is `" + commands[command_name]["permission_level"] + "`.");
                      }else{
                        bot.sendMessage(message.channel, "`" + command_name + "`' Required Permission Level is `" + commands[command_name]["permission_level"] + "`.");
                      }
                    }
                  }catch(e){
                    logCommandError(e, "GetCommandPerms Command", message);
                  }
                }
    },
    "donger":{
      "min_args": 1,
      "max_args": 1,
      "description": "Returns a random donger message.",
      "permission_level": 0,
      "type": "debug",
      "usage": "",
      "process": function(bot, message, args){
                  try{
                    var options = ["work it ᕙ༼ຈل͜ຈ༽ᕗ harder\nmake it (ง •̀_•́)ง better\ndo it ᕦ༼ຈل͜ຈ༽ᕤ faster\nraise ur ヽ༼ຈل͜ຈ༽ﾉ donger","ヽ༼ຈل͜ຈ༽ﾉ RAISE YOUR DONGERS ヽ༼ຈل͜ຈ༽ﾉ", "( ͡° ͜ʖ ͡°)", " `¯\_(ツ)_/¯`", "(∩ ͡° ͜ʖ ͡°)⊃━☆ﾟ. * ･ ｡ﾟYou've been touched by the donger fairy", "BACK OFF MODERINOS I'VE GOT A GUN! ༼ຈل͜ຈ༽_•︻̷┻̿═━一", "┌༼ຈل͜ຈ༽┘test donger, please ignore ┌༼ຈل͜ຈ༽┘", "ᗜԅ(╭ರ╭ ͟ʖ╮ ͡•)-☂ 'Ello, Chaps!", "ヽ༼ຈل͜ຈ༽ﾉ RAISE YOUR PROCESSOR ヽ༼ຈل͜ຈ༽ﾉ http://i.imgur.com/IpbuCBT.png", "༼ ▀̿̿Ĺ̯̿̿▀̿ ༼ ▀̿̿Ĺ̯̿̿▀̿༽▀̿̿Ĺ̯̿̿▀̿ ༽ DONGER POLICE ON DUTY ༼ ▀̿̿Ĺ̯̿̿▀̿ ༼ ▀̿̿Ĺ̯̿̿▀̿༽▀̿̿Ĺ̯̿̿▀̿ ༽", "乁༼=͡X͜ʖ͡X=༽ᕤThis Donger Has been Raised Too much And Died 乁༼=͡X͜ʖ͡X=༽ᕤ 1 Like = 1 Donger life", "乁(ಥ౪ಥ;)ㄏ How Can Our Dongs Be Real If Our Raises Aren't Real", "('ºل͟º) My dongers are scared ('ºل͟º)", "ಠ_ಠ", "( ͡° ͜🔴( ͡° ͜🔴( ͡° ͜🔴 ͡°) YOU CAME TO THE WRONG CIRCUS ( ͡° ͜🔴( ͡° ͜🔴( ͡° ͜🔴 ͡°)", "HAIL THE ONE DONGER BILL http://i.imgur.com/y1FHd0i.jpg"];
                    var random = Math.floor(Math.random()*options.length);
                    bot.sendMessage(message.channel, message.author.mention() + " " + options[random]);
                  }catch(e){
                    logCommandError(e, "Donger Command", message);
                  }
                }
    },
    "eval":{
      "min_args": 2,
      "max_args": 100,
      "description": "Evaluates some code and returns with time taken to execute. DANGEROUS.",
      "permission_level": 15,
      "type": "debug",
      "usage": "",
      "process": function(bot, message, args){
                  try{
                    var start = now();
                    var toEval = args.splice(2, args.length-2).join(" ");
                    var evaluated = eval(toEval);
                    var end = now();
                    var toSend = "```python\n" + toEval + "\n----------Evaluates to:----------\n" + evaluated + "\n---------------------------------\nIn " + Math.floor((end-start)*100)/100 + " ms!```";
                    bot.sendMessage(message.channel, toSend);
                  }catch(e){
                    logCommandError(e, "Eval Command", message);
                  }
                }
    },
    "userstatus":{
      "min_args": 2,
      "max_args": 2,
      "description": "Gets status of a specific user.",
      "permission_level": 10,
      "type": "command",
      "usage": "",
      "process": function(bot, message, args){
                  try{
                    if(message.mentions.length > 0){
                      bot.sendMessage(message.channel, "`" + message.mentions[1].name + "`'s status is " + message.mentions[1].status);
                    }
                  }catch(e){
                    logCommandError(e, "UserStatus Command", message);
                  }
                }
    },
    "status":{
      "type": "command", 
      "min_args": 1,
      "max_args": 1,
      "description": "Gets status of the bot.",
      "permission_level": 0,
      "usage": "",
      "process": function(bot, message, args){
                    try{
                      var servers = getServerCount();
                      var users = getUserCount();
                      
                      var currentGame = bot.user.game.name;
                      
                      var username = bot.user.name;
                      var avatarURL = bot.user.avatarURL;
                      var status = bot.user.status;
                      
                      bot.sendMessage(message.channel, botMention + " Status: \n```xl\n" + "Username: '" + username + "'\nStatus: " + status + "\nGame: " + currentGame + "\nAvatar: " + avatarURL +"\n----\nServers: " + servers + "\nUsers: " + users + "\n----\nUptime: " + getBotUptimeString() + "\n```");
                    }catch(e){
                      bot.sendMessage(message, message.author.mention() + " Unable to process command, please contact my developer for help!");
                      logCommandError(e, "Status Command", message);
                    }
                  }
    },
    "google":{
      "type": "command",
      "min_args": 2,
      "max_args": 100,
      "description": "Helps you google stuff! Very useful.",
      "permission_level": 0,
      "usage": "[search terms]",
      "process": function(bot, message, args){
                    try{
                      args.shift();
                      args.shift();
                      var search_terms = args.join("+");
                      bot.sendMessage(message, "http://lmgtfy.com/?q="+search_terms);
                    }catch(e){
                      logCommandError(e, "Google Command", message);
                    }
                  }
    },
    "youtube":{
      "type": "command",
      "min_args": 2,
      "max_args": 100,
      "description": "Searches for a video on youtube.",
      "permission_level": 0,
      "usage": "[search terms]",
      "process": function(bot, message, args){
                    try{
                      args.shift();
                      args.shift();
                      var search_terms = args.join("+");
                      var searchURL = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q="+encodeURIComponent(search_terms)+"&key="+ keys["youtube"];
                      request(searchURL, function(error, response, body){
                        var json_response = JSON.parse(body);
                        var items = json_response.items;
                        var video = items[0];
                        if(!video){
                          bot.sendMessage(message, "Could not find a video with the keywords specified.");
                          return;
                        }else{
                          var videoURL = "https://www.youtube.com/watch?v=" + video.id.videoId;
                          var searchMoreURL = "https://www.youtube.com/results?search_query=" + search_terms;
                          var videoMessage = "Found the video `" + video.snippet.title + "`: " + videoURL;
                          bot.sendMessage(message, videoMessage, (error, message)=>{
                            bot.sendMessage(message, "Not the video you were looking for? Search again or try " + searchMoreURL);
                          });
                        }
                      });
                    }catch(e){
                      logCommandError(e, "YouTube Command", message);
                    }
                  }
    }
}

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

function log(message, save, file){
  try{
    save = save || false;
    file = file || "output-log.txt";
    toLog = chalk.bold(getConsoleTimestamp()) + message;
    console.log(toLog);
    if(save){
      toLog = "\r\n" + toLog;
      fs.appendFileSync(file, chalk.stripColor(toLog));
      return;
    }else{
      return;
    }
  }catch(e){
    console.log(chalk.red("[log()] ERROR: ") + e);
  }
}

function logError(message, prefix){
  try{
    prefix = prefix || false;
    if(!prefix){
      log(chalk.red("ERROR: ") + message, true, "error-log.txt");
    }else{
      log(chalk.red("["+ prefix + "] "+ "ERROR: ") + message, true, "error-log.txt");
    }
  }catch(e){
    log(chalk.red("[logError()] ERROR: ") + e, true, "error-log.txt");
  }
}

function logDebug(message, prefix){
  try{
    prefix = prefix || false;
    if(!prefix){
      log(chalk.yellow("DEBUG: ") + message, true, "debug-log.txt");
    }else{
      log(chalk.yellow("["+ prefix + "] "+ "DEBUG: ") + message);
    }
  }catch(e){
    logError(e, "logDebug()");
  }
}

function logWarning(message, prefix){
  try{
    prefix = prefix || false;
    if(!prefix){
      log(chalk.magenta("DEBUG: ") + message, true, "error-log.txt");
    }else{
      log(chalk.magenta("["+ prefix + "] "+ "WARNING: ") + message, true, "error-log.txt");
    }
  }catch(e){
    logError(e, "logWarning()");
  }
}

function logCommandError(error, prefix, message){
  try{
    logDebug(error, prefix);
    if(message.author.id == config.bot.developer){
      bot.sendMessage(message, message.author.mention() + " " + prefix + " Unable to process. Check the console for more info.");
      return;
    }
    bot.sendMessage(message, message.author.mention() + " Unable to process command, please contact my developer for assistance!"); 
  }catch(e){
    logError(e, "logCommandError()");
  }
}

function consolePing(){
  try{
    var time = new Date(bot.uptime);
    log("I'm still here! I have been online for " + Math.floor(bot.uptime/60000) + " minutes."); 
  }catch(e){
    logError(e, "consolePing()");
  }
}

function getBotUptimeString(){
  try{
    var uptime = bot.uptime;
    uptime /= 1000;
    var seconds = Math.floor(uptime % 60);
    uptime /= 60;
    var minutes = Math.floor(uptime % 60);
    uptime /= 24;
    var hours = Math.floor(uptime % 24);
    var days = Math.floor(uptime);
    
    return days + " days, " + hours +  " hours, " + minutes + " minutes, " + seconds + " seconds";
  }catch(e){
    logError(e, "getBotUptimeString()");
  }
  return false;
}

function channelIsEmpty(channel){
  try{
    if(channel.members.length == 0){
      return true;
    }else{
      return false;
    }
  }catch(e){
    logError(e, "channelIsEmpty()");
  }
}

function getRoleFromID(server, id){
  try{
    return server.roles.get("id", id);
  }catch(e){
    logError(e, "getRoleFromID()");
  }
}

//Returns permission level as a number
function getAuthorPermissionLevel(message){
  try{
    logDebug("getAuthorPermissionLevel() was called", "getAuthorPermissionLevel()");
    messageServer = message.channel.server;
    userRoles = messageServer.rolesOfUser(message.author);
    highestRole = 1;
    userRoles.forEach(function(role, index){
      role = role['name'].toLowerCase();
      var rolePerms = config['user_permissions'][role];
      if(rolePerms > highestRole){
        highestRole = rolePerms;
      }
    });
    return highestRole;
  }catch(e){
    logError(e, "getAuthorPermissionLevel()");
  }
}

function getUserPermissionLevel(server, user){
  try{
    userRoles = server.rolesOfUser(user);
    highestRole = 1;
    userRoles.forEach(function(role, index){
      role = role['name'].toLowerCase();
      var rolePerms = config['user_permissions'][role];
      if(rolePerms > highestRole){
        highestRole = rolePerms;
      }
    });
    return highestRole;
  }catch(e){
    logError(e, "getUserPermissionLevel()");
  }
}

//Logs into discord
function login(){
  try{
    log("Logging into Discord...");
    bot.loginWithToken(token, function(error, token){
      if(error != null){
        logError("Could not log into Discord: " + error, "login()");
      };
    });
  }catch(e){
    logError(e, "login()");
  }
}

function setNickname(server){
  try{
    bot.setNickname(nickname);
  }catch(e){
    logError(e, "setNickname()");
  }
}

function setDefaultGame(){
  try{
    bot.setPlayingGame(defaultGame);
  }catch(e){
    logError(e, "setDefaultGame()");
  }
}

function updateGame(){
  try{
    var position = 0;
    var setString = ""
    switch(position){
      case 1:
        position = 0;
        setString = "on " + getServerCount() + " Servers.";
        break;
      case 0:
        position++;
        setString = "with " + getUserCount() + " Users.";
        break;
    }
    bot.setPlayingGame(setString, function(error){
      if(error != null){
        logError("Unable to set active game: " + error, "updateGame()");
      }
    });
  }catch(e){
    logError(e, "updateGame()");
  }
}

function isHidden(command){
  try{
    if(commands[command]["type"] == "hidden"){
      return true;
    }else{
      return false;
    }
  }catch(e){
    logError(e, "isHidden()");
  }
}

function isAlias(command){
  try{
    if(commands[command]["type"] == "alias"){
      return true;
    }else{
      return false;
    }
  }catch(e){
    logError(e, "isHidden()");
  }
}

function getAlias(command){
  try{
    if(commands[command]["type"] == "alias"){
      return commands[command]["alias"];
    }else{
      return undefined;
    }
  }catch(e){
    logError(e, "getAlias()");
  }
}

//Relatively self-explanatory.
function getCommandsList(message){
  try{
    var result = "```javascript\n";
    var isDev = bot.memberHasRole(message.author, message.channel.server.roles.get("name", "Developer"));
    for(var command in commands){
      var command_isAlias = isAlias(command);
      var command_description;
      var command_name = command;

      //Changes the command to the real command if
      //it is an alias, otherwise sets description.
      if(command_isAlias){
        command = getAlias(command);
        command_description = "Alias of " + command + ".";
      }else{
        command_description = commands[command]["description"];
      }

      //Preventing description from not being set, however this doesn't currently seem to work.
      if(command_description == undefined){
        command_description = "None.";
      }

      //If the command is not hidden, so that it can display
      if(!isHidden(command)){
        var command_perms = commands[command]["permission_level"];
        var command_type = commands[command]["type"];
        var command_usage = commands[command]["usage"]
        var min_args = commands[command]["min_args"];
        var max_args = commands[command]["max_args"];
        var sender_perms = getUserPermissionLevel(message.channel.server, message.author);

        var display = true;
        if(command_type == "debug") display = false;
        
        if(command_isAlias && message.content.indexOf("alias") < 0){
          display = false;
        }
        
        //In case usage is not set, don't leave a weird gap.
        if(command_usage != ""){
          command_usage = " " + command_usage;
        }

        if(display){
          if(sender_perms >= command_perms){
            result += "\n" + command_name + ":";
            result += "\n    Description: \"" + command_description + "\"";
            result += "\n    Usage:       \"@" + name + " " + command_name + command_usage + "\"";
          }
        }
      }
    }
    result += "\n```";
    return result;
  }catch(e){
    logError(e, "getCommandsList()")
  }
}

function getRankFromPermissionLevel(permission_level){
  try{
    for(var rank in config['user_permissions']){
      if(config['user_permissions'][rank] == permission_level){
        return rank;
      }
    }
  }catch(e){
    logError(e, "getRankFromPermissionLevel()");
  }
}

function getConsoleUser(message){
  try{
    return message.author.name + "@" + message.author.id;
  }catch(e){
    logError(e, "getConsoleUser()");
  }
}

function authorHasPerms(command, message){
  try{
    logDebug("authorHasPerms() was called", "authorHasPerms()");
    if(getAuthorPermissionLevel(message) >= command['permission_level']){
      return true;
    }else{
      return false;
    }
  }catch(e){
    logError(e, "authorHasPerms()");
  }
}

function userHasPerms(command, server, user){
  try{
    if(getUserPermissionLevel(server, user) >= command['permission_level']){
      return true;
    }else{
      return false;
    }
  }catch(e){
    logError(e, "userHasPerms()");
  }
}

function verifyTemp(channel){
  try{
    if(channel.name in channels[channel.server.id]){
      if(channel.members.length == 0 && channels[channel.server.id][channel.name]["activated"] == false){
        var channelCreator = channels[channel.server.id][channel.name]["creator"];
        bot.deleteChannel(channel);
        bot.sendMessage(channelCreator, "Your channel " + channel.name + " was deleted, because you didn't join it within 30 seconds.");
      } 
    }
  }catch(e){
    logError(e, "verifyTemp()");
  }
 }

function printChannels(){
  try{
    for(var server in channels){
      logDebug("Server ID '" + server + "':", "printChannels()");
      for(var channel in channels[server]){
        logDebug("    Channel '" + channel + "':", "printChannels()");
        for(var item in channels[server][channel]){
          logDebug("        " + item + ": " + channels[server][channel][item], "printChannels()");
        }
      }   
    }
  }catch(e){
    logError(e, "printChannels()");
  }
}

function createTextForVoice(channel){
  try{
    bot.createChannel(channel.server, channel.name + "-text", "text", function(error, newchannel){
      if(error == null){
        var role = {
          hoist:  false,
          name: channel.name+"-role",
        }
        bot.createRole(channel.server, role, function(error, role){
          if(error == null){
            channels[channel.server.id][channel.name]["role"]
            bot.overwritePermissions(newchannel, role, {
            "readMessages": true,
            "sendMessages": true
          });
            bot.overwritePermissions(newchannel, server.id, {
            "readMessages": false,
            "sendMessages": false
          }, function(error){
              if(error == null){
                logDebug("successfully created channel, role, and edited permissions for @everyone")
              }
            });
          }
        });
      }
    });
  }catch(e){
    logError(e, "createTextForVoice()");
  }
}

function purgeChannels(server){
  try{
    //log("The Purge has begun!")
    var server_channels = server.channels.getAll("type", "voice");
    var count = 0;
    for(var i = 0; i < server_channels.length; i++){
      var active_channel = server_channels[i];
      //If the channel is temporary and has nobody in it
      if(!(active_channel["name"] in channels[server.id]) && active_channel.members.length == 0){
        bot.deleteChannel(active_channel);
        logDebug("Deleted channel " + active_channel["name"]);
        count++;
      //If the channel is temporary but has people in it
      }else if(!(active_channel["name"] in channels[server.id]) && active_channel.members.length > 0){
        //Adds to array of temp channels
        channels[server.id][active_channel["name"]] = {
          "type": "temp",
          "activated": true,
          "creator": "none",
        }
        log("Added channel " + active_channel["name"] + " to the channels list, assumed to be temporary.");
      }
    }
    updateConfig();
    return count;
  }catch(e){
    logError(e, "purgeChannels()");
  }
}

//Returns true if the string given is a command, and false if it is not.
function isCommand(command_string){
  try{
    var command = commands[command_string];
    if(command == undefined){
      return false;
    }else{
      return true;
    }
  }catch(e){
    logError(e, "isCommand()");
  }
}

function runCommand(command, message, args){
  try{
    if(userHasPerms(command, message.channel.server, message.author)){
      var min_args = command["min_args"]+1;
      var max_args = command["max_args"]+1;

      if(args.length < min_args){
        bot.sendMessage(message.channel, message.author.mention() + " not enough arguments!");
      }else if(args.length > max_args){
        bot.sendMessage(message.channel, message.author.mention() + " too many arguments!");
      }else{
        try{
          command["process"](bot, message, args);
        }catch(e){
          log("Error in processing the command \"" + command + "\": " + e);
          bot.sendMessage(message.channel, message.author.mention() + " Unable to process command, sorry! Contact my developer to have that fixed.");
        }
      }
    }else{
      bot.sendMessage(message.channel, message.author.mention() + " You do not have permission to use this command!");
    }
  }catch(e){
    logError(e, "runCommand()");
  }
}

//Rather obvious. Sets config to the current config stuff. Mainly used for channels.
function updateConfig(){
  try{
    fs.writeFileSync(configName, JSON.stringify(config, null, "\t"));
  }catch(e){
    logError(e, "updateConfig()");
  }
}

function removeTempFromConfig(server){
  try{
    for(var channel in channels[server.id]){
      if(channels[server.id][channel]["type"] == "temp"){
        delete channels[server.id][channel]
      }
    }
    updateConfig();  
  }catch(e){
    logError(e, "removeTempFromConfig()");
  }
}

function addToConfig(server){
  if(!(server.id in channels)){
    channels[server.id] = {}
    logDebug("Server " + server.name + " not in config, adding.", "addToConfig()");
    updateConfig();
    addToConfig(server);
  }
}

function getUserCount(){
  try{
    return bot.users.length;
  }catch(e){
    logError(e, "getUserCount()");
  };
}

function getServerCount(){
  try{
    return bot.servers.length;
  }catch(e){
    logError(e, "getServerCount()");
  };
}

function getServing(){
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

  return "Now serving " + serverCount + " " + serverString + " with " + userCount + " " + userString + ".";
}

var botMention = undefined;
bot.on("ready", function(){
  try{
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

    defaultGame = "@" + name + " Help";

    setDefaultGame();

    bot.sendMessage(config["bot"]["developer"], botMention + " is now online!");

    log(name + " version " + version + " now online, serving " + serverCount + " " + serverString + " with " + userCount + " " + userString + ".", true);
    var purged_channels = 0;
    log("The Purge has begun!");
    for(var i = 0; i < bot.servers.length; i++){
        var active_server = bot.servers[i];
        //bot.sendMessage(active_server.defaultChannel, "Our world is worth fighting for! " + botMention + " ready for duty!");
        addToConfig(active_server);
        purged_channels += purgeChannels(active_server);
        removeTempFromConfig(active_server);
    }
    if(purged_channels == 1){
      log("The Purge has completed, decimating " + purged_channels + " channel.");
    }else{
      log("The Purge has completed, decimating " + purged_channels + " channels."); 
    }
    //setInterval(function(){updateGame()}, 5000);
    //setInterval(function(){consolePing();}, (15*(1000*60)));
  }catch(e){
    logError(e, "Ready Event");
  }
});

bot.on("message", function(message){
  try{
    if(message.author.id == bot.user.id){
      return;
    }else{
      if(message.content.startsWith(botMention)){
        if(!message.channel.isPrivate){
          log(getConsoleUser(message) + " has executed the command: " + message.content.replace(botMention, "@" + name), true);
          var args = message.content.split(" ");
          if(args.length == 1){
            bot.sendMessage(message.author, message.author.mention() + " You have not entered a command! Type \"" + botMention + " help\" for help!");
          }else{
            switch(args[1]){
              default:
                commandName = args[1];
                commandName = commandName.toLowerCase();
                command = commands[commandName];

                if(command != undefined){
                  if(command["delete"] != false){
                    //bot.deleteMessage(message);
                  }
                  if(command["type"] == "alias"){
                    var alias = command["alias"];
                    var command = commands[alias];
                  }
                  if(command != undefined){
                    runCommand(command, message, args);
                  }else{
                    bot.sendMessage(message.channel, message.author.mention() + " Unknown command! Type \"" + botMention + " help\" for help!");
                  }
                }else{
                  //bot.deleteMessage(message);
                  bot.sendMessage(message.channel, message.author.mention() + " Unknown command! Type \"" + botMention + " help\" for help!");
                }
            }
          }
        }else{
          bot.sendMessage(message.author, "You can't execute commands from PM!");
        }
      }
    }
  }catch(e){
    logError(e, "Message Event");
  }
});

bot.on("serverNewMember", function(server, user){
  try{
    bot.sendMessage(server.defaultChannel, "Welcome " + user.mention() + ", I hope you have an a-Mei-zing time here!");
  }catch(e){
    logError(e, "serverNewMember Event");
  }
});

bot.on("messageDeleted", function(message, channel){
  try{
    logDebug("Message sent by " + message.author.name + " was deleted from " + channel.name);
    logDebug("Content: \"" + message.content + "\"");
  }catch(e){
    logError(e, "messageDeleted Event");
  }
});

function removeRepeat(user, role){
  try{
    if(bot.memberHasRole(user,role)){
      bot.removeMemberFromRole(user, role, function(error){
        //log("Removing role " + role.name + " from " + user.name);
        if(error != null){
          //log("Error removing role: " + error);
        }else{
          //log("Removed role successfully!");
          setTimeout(function(){
            if(bot.memberHasRole(user, role)){
              //log("Role was apparently not removed. Removing again.");
              removeRepeat(user, role);
            }
          }, 100);
        }
      });
    }
  }catch(e){
    logError(e, "removeRepeat Event")
  }
}

function addRepeat(user, role){
  if(!(bot.memberHasRole(user,role))){
    try{
      bot.addMemberToRole(user, role, function(error){
        if(error == null){
          setTimeout(function(){
            if(!(bot.memberHasRole(user, role))){
              addRepeat(user, role);
            }
          }, 100);
        }
      });
    }catch(e){
      logError(e, "addRepeat Event");
    }
    }
}

bot.on("voiceLeave", function(channel, user){
  //log("User " + user.name + " left channel " + channel.name);
  try{
    if(channel.members.length == 0 && channels[channel.server.id][channel.name]["type"] == "temp"){
      logDebug("Deleted temporary channel " + channel.name + ", because it is empty.", "voiceLeave Event");
      bot.deleteChannel(channel);
    }else{
      logDebug(channel.members.length);
      logDebug(channels[channel.server.id].type);
    }
  }catch(e){
    logError(e, "voiceLeave Event");
  }
});

bot.on("voiceJoin", function(channel, user){
  try{
    if(channel.name in channels[channel.server.id]){
        if(channels[channel.server.id][channel.name]["type"] == "temp" && channels[channel.server.id][channel.name]["activated"] == false){
          channels[channel.server.id][channel.name]["activated"] = true;
        }
    }
  }catch(e){
    logError(e, "voiceJoin Event");
  }

});

bot.on("channelCreated", function(channel){
  try{
    //Just in case someone creates a new text channel.
    log(channel);
    if(channel.type == "voice"){
      if(channel.name in channels[channel.server.id]){
        bot.deleteChannel(channel);
      }
      //If it isn't a temp channel the bot made and doesn't already exist in the channel array.
      if(!(channel.name in channels[channel.server.id]) && madeByBot == false){
        channels[channel.server.id][channel.name] = {
          "type": "perm",
          "creator": "none"
        }
        updateConfig();
        logDebug("Channel " + channel.name + " has been created, assumed to be permanent.");
      }
    }
  }catch(e){
    logError(e, "channelCreated Event");
  }
});

bot.on("channelDeleted", function(channel){
  try{
    if(channel.name in channels[channel.server.id] && channel.type == "voice"){
      if(channels[channel.server.id][channel.name]["type"] == "temp"){
        var creator = channels[channel.server.id][channel.name]["creator"].toString();
        var userIndex = users.indexOf(creator);
        if(userIndex > -1){
          users.splice(userIndex, 1);
        }
      }
      delete channels[channel.server.id][channel.name];
      logDebug("Deleted channel " + channel.name + " from array and config.");
      updateConfig();
    }
  }catch(e){
    logError(e, "channelDeleted Event");
  }
});

bot.on("channelUpdated", function(oldchannel, newchannel){
  try{
    if(oldchannel.name != newchannel.name && oldchannel.name in channels[channel.server.id]){
      logDebug("A channel's name has changed!")
      channels[channel.server.id][newchannel.name] = channels[channel.server.id][oldchannel.name];
      delete channels[channel.server.id][oldchannel.name];
      updateConfig();
    }
  }catch(e){
    logError(e, "channelUpdated Event");
  }
});

bot.on("serverCreated", function(server){
  try{
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

    log("I've joined a new server (" + server.name + ")! "+ getServing(), true);
    addToConfig(server);
  }catch(e){
    logError(e, "serverCreated Event");
  }
});

bot.on("serverDeleted", function(server){
  try{
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

    log("I've left a server (" + server.name + ") :( ... "+ getServing(), true);
  }catch(e){
    logError(e, "serverDeleted Event");
  }
});

bot.on("disconnect", function(){
  try{
    log("Disconnected from Discord. Attempting to reconnect...");
    login();
  }catch(e){
    logError(e, "Disconnect Event");
  }
});

bot.on("debug", function(error){
  logDebug(error, "Debug Event");
});

bot.on("warn", function(error){
  logWarning(error, "Warn Event");
  //logDebug("Restarting bot, just to be safe.", "Warn Event");
  //bot.logout();
  //process.exit();
});

bot.on("error", function(error){
  logError(error, "Error Event");
  logDebug("Restarted bot due to error.", "Error Event");
  logDebug("Restarting bot, just to be safe.", "Error Event");
  bot.logout();
  process.exit();
});

try{
  login();
}catch(e){
  logError(e, "Intiial Login Attempt");
}