var Discord = require("discord.js");

var bot = new Discord.Client({autoReconnect: true});
var fs = require('fs');
var config = require('./config.json');
var package = require('./package.json')
var name;
var version = package['version']
var token = config["bot"]["token"]
var defaultGame;

// Setting up a command:
//  Basics:
//    Unless the command is hidden, you need
//    a description.
//
//    If the type is "hidden", it won't show
//    up in the commands list
//
//  Arguments:
//    @BotName command argument1 argument2
//    args[0]      args[1] [args2]   args[3]
//
//    min_args and max_args begin at args[1],
//    In the above example, if you want only
//    '@BotName command' as the argument,
//    both min_args and max_args should be 1.
//
//  Permissions:
//    All commands MUST have a permission
//    level, or they won't work at all. All
//    permission numbers may be referenced
//    in config.json
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

var commands = {
    "help":{
      "description": "Shows you this list!",
      "type": "command",
      "permission_level": 0,
      "min_args": 1,
      "max_args": 1,
      "usage": "",
      "process": function(bot, message, args){
                    bot.sendMessage(message.author, botMention + " commands:\n" + getCommandsList(message));
                  }
    },
    "commands":{
      "type": "alias",
      "alias": "help"
    },
    "channel":{
      "description": "Manages channels.",
      "type": "command",
      "permission_level": 0,
      "min_args": 1, //
      "max_args": 4,
      "usage": "creator <channel>",
      "process": function(bot, message, args){
                  permissions = getAuthorPermissionLevel(message);
                  switch(args[2]){
                    case "creator":
                      if(args.length == 4){
                          channel = args[3]
                          if(args[3] in channels){
                            var creator = channels[args[3]]["creator"];
                            if(creator != "none"){
                                bot.sendMessage(message.author, args[3] + "'s creator is " + channels[args[3]]["creator"]);
                            }else{
                              bot.sendMessage(message.author, args[3] + "'s creator is unknown, sorry :(")
                            }
                          }else{
                            bot.sendMessage(message.author, args[3] + " does not exist or cannot be found!");
                          }
                      }
                      break;
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
                    log(getConsoleUser(message) + " Restarted the bot!", true);
                    //bot.setPlayingGame("Restarting...")
                    bot.sendMessage(message.channel, "I'm restarting, be back in a jiffy!", function(error){
                      bot.logout();
                      process.exit();
                    });
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
      "max_args": 2,
      "usage": "<channel-name>",
      "process": function(bot, message, args){
                  channelName = args[2];
                  if(channelName.length <= 95 && channelName.length >= 2){
                    madeByBot = true;
                    bot.createChannel(message.channel.server, channelName, "voice", function(error, channel){
                      if(error == null){
                        log(getConsoleUser(message) + " created temporary channel " + channelName + " at the request of " + message.user + ".", true);
                        channels[channelName] = {
                          "type": "temp",
                          "activated": false,
                          "creator": message.author
                        }
                        if(message.author.voiceChannel == null){
                          bot.sendMessage(message.author, message.author.mention() + " Temporary channel created successfully. Please join in 30 seconds or it will be deleted.");
                          setTimeout(function(){
                                      verifyTemp(channel);
                                    }, 30000);
                        }else{
                          channels[channelName] = {
                            "type": "temp",
                            "activated": true,
                            "creator": message.author
                          }
                          bot.moveMember(message.author, channel);
                        }
                      }else{
                        bot.sendMessage(message.author, message.author.mention() + " Unable to create channel, please try again later :(");
                        log(error);
                      }
                    });
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
                    bot.sendMessage(message.channel, message.author.mention() + " has asked me to log out :(... goodbye!", function(error){
                      log("Bot has logged out.", true);
                      bot.logout();
                    });
                 }
    },
    "logout":{
      "type": "alias",
      "alias": "disconnect"
    },
    "setgame":{
      "min_args": 2,
      "max_args": 2,
      "permission_level": 13,
      "description": "Sets the bot's game. Only 1-word games can be manually set.",
      "type": "command",
      "usage": "<game>",
      "process": function(bot, message, args){
                    bot.setPlayingGame(args[2]);
                  }
    },
    "resetgame":{
      "min_args": 1,
      "max_args": 1,
      "permission_level": 13,
      "description": "Sets the bot's game.",
      "type": "command",
      "usage": "<game>",
      "process": function(bot, message, args){
                    setDefaultGame();
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
                  purgeChannels(message.channel.server);
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
                  bot.sendMessage(message.channel, "My botMention is ```\n"+botMention+"\n```");
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
                    printChannels();
                  }
    },
    "getroleid":{
      "min_args": 2,
      "max_args": 2,
      "permission_level": 13,
      "description": "Logs the ID of a specified role.",
      "type": "debug",
      "usage": "<role>",
      "process": function(bot, message, args){
                    log(message.channel.server.roles.get("name", args[2]).id);
                  }
    },
    "delete":{
      "min_args": 2,
      "max_args": 2,
      "permission_level": 13,
      "type": "hidden",
      "usage": "<channel>",
      "process": function(bot, message, args){
                    var toDelete = args[2];
                    log(toDelete);
                    if(toDelete in channels){
                        channelToDelete = message.channel.server.channels.get("name", toDelete);
                        log(channelToDelete);
                        bot.deleteChannel(channelToDelete, function(error){
                          if(error == null){
                            log("Successfully deleted channel " + toDelete + " at the request of " + message.author.name, true);
                          }else{
                            log("Unable to delete the channel " + toDelete + ": " + error);
                          }
                        });
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
                  updateConfig();
                }
    }

}

var channels = config['channels'];
var madeByBot = false;

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
  toLog = getConsoleTimestamp() + message;
  console.log(toLog);
  if(save){
    fs.appendFileSync("output-log.txt", "\n" + toLog);
  }
}

function channelIsEmpty(channel){
  console.log(channel.members.length);

  return true;
}

function getRoleFromID(id){
  return bot.servers[0].roles.get("id", id);
}

//Returns permission level as a number
function getAuthorPermissionLevel(message){
  log(message.author.name + " has sent a command, getting permission level...");
  messageServer = message.channel.server;
  userRoles = messageServer.rolesOfUser(message.author);
  highestRole = 1;
  userRoles.forEach(function(role, index){
    role = role['name'].toLowerCase();
    var rolePerms = config['user_permissions'][role];
    log(role + " - " + rolePerms);
    if(rolePerms > highestRole){
      highestRole = rolePerms;
    }
  });
  log(highestRole);
  return highestRole;
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

function setDefaultGame(){
  bot.setPlayingGame(defaultGame);
}

function updateGame(){
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
      log("Unable to set active game: " + error);
    }
  });
}

function isHidden(command){
  if(commands[command]["type"] == "hidden"){
    return true;
  }else{
    return false;
  }
}

function isAlias(command){
  if(commands[command]["type"] == "alias"){
    return true;
  }else{
    return false;
  }
}

function getAlias(command){
  if(commands[command]["type"] == "alias"){
    return commands[command]["alias"];
  }else{
    return undefined;
  }
}

//Relatively self-explanatory.
function getCommandsList(message){
  var result = "```javascript\n";
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
      var sender_perms = getAuthorPermissionLevel(message);

      var display = true;
      if(command_type == "debug"){
        //Unless I am the one seeing it, don't send these.
        if(message.author.id == config["bot"]["developer"]){
          display = true;
          command_description += " (Debug)";
        }else{
          display = false;
        }
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
  result += "```";
  return result;
}

function getRankFromPermissionLevel(permission_level){
  for(var rank in config['user_permissions']){
    if(config['user_permissions'][rank] == permission_level){
      return rank;
    }
  }
}

function getConsoleUser(message){
  return message.author.name + "@" + message.author.id;
}

function authorHasPerms(command, message){
  if(getAuthorPermissionLevel(message) > command['permission_level']){
    return true;
  }
  return false;
}

function verifyTemp(channel){
  if(channel.members.length == 0 && channels[channel.name]["activated"] == false){
    var channelCreator = channels[channel.name]["creator"];
    bot.deleteChannel(channel);
    bot.sendMessage(channelCreator, "Your channel " + channel.name + " was deleted, because you didn't join it within 30 seconds.");
  }
 }

function printChannels(){
  for(var channel in channels){
    log(channel + ":");
    for(var item in channels[channel]){
      log("    " + item + ": " + channels[channel][item]);
    }
  }
}

function createTextForVoice(channel){
  bot.createChannel(channel.server, channel.name + "-text", "text", function(error, newchannel){
    if(error == null){
      var role = {
        hoist:  false,
        name: channel.name+"-role",
      }
      bot.createRole(channel.server, role, function(error, role){
        if(error == null){
          channels[channel.name]["role"]
          bot.overwritePermissions(newchannel, role, {
          "readMessages": true,
          "sendMessages": true
        });
          bot.overwritePermissions(newchannel, server.id, {
          "readMessages": false,
          "sendMessages": false
        }, function(error){
            if(error == null){
              log("successfully created channel, role, and edited permissions for @everyone")
            }
          });
        }
      });
    }
  });
}

function purgeChannels(server){
  log("The Purge has begun!")
  var server_channels = server.channels.getAll("type", "voice");
  var count = 0;
  for(var i = 0; i < server_channels.length; i++){
    var active_channel = server_channels[i];
    //If the channel is temporary and has nobody in it
    if(!(active_channel["name"] in channels) && active_channel.members.length == 0){
      bot.deleteChannel(active_channel);
      count++;
    //If the channel is temporary but has people in it
    }else if(!(active_channel["name"] in channels) && active_channel.members.length > 0){
      //Adds to array of temp channels
      channels[active_channel["name"]] = {
        "type": "temp",
        "activated": true,
        "creator": "none",
      }
      log("Added channel " + active_channel["name"] + " to the channels list, assumed to be temporary.");
    }
  }
  if(count == 1){
      log("The Purge has completed, decimating " + count + " channel.");
  }else{
      log("The Purge has completed, decimating " + count + " channels.");
  }
}

function runCommand(command, message, args){
  //getAuthorPermissionLevel(message) >= command['permission_level']
  if(authorHasPerms(command, message)){
    var min_args = command["min_args"]+1;
    var max_args = command["max_args"]+1;

    if(args.length < min_args){
      bot.sendMessage(message.channel, message.author.mention() + " not enough arguments!");
    }else if(args.length > max_args){
      bot.sendMessage(message.channel, message.author.mention() + " too many arguments!");
    }else{
      command["process"](bot, message, args);
    }
  }else{
    bot.sendMessage(message.channel, message.author.mention() + " You do not have permission to use this command!");
  }
}
/*var config = undefined;
function getConfig(onComplete){
  fs.readFile("config.json", function(err, contents){
    config = JSON.parse(contents);
    onComplete();
  });
}*/

//Rather obvious. Sets config to the current config stuff. Mainly used for channels.
function updateConfig(){
  log("Beginning to update config...")
  fs.writeFileSync("config.json", JSON.stringify(config, null, "\t"));
  log("Updated config!");
}

function removeTempFromConfig(){
  for(var channel in channels){
    if(channels[channel]["type"] == "temp"){
      delete channels[channel]
    }
  }
  updateConfig();
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
  console.log("---------- CONNECTED TO DISCORD ----------");

  name = bot.user.name;

  defaultGame = "@" + name + " Help";

  setDefaultGame();

  log(name + " version " + version + " now online, serving " + serverCount + " " + serverString + " with " + userCount + " " + userString + ".", true);
  removeTempFromConfig();
  for(var i = 0; i < bot.servers.length; i++){
      purgeChannels(bot.servers[i]);
  }
  //setInterval(function(){updateGame()}, 5000);
})

bot.on("message", function(message){
  if(message.author == bot.user){
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
              command = commands[args[1]];

              if(command != undefined){
                if(command["delete"] != false){
                  bot.deleteMessage(message);
                }
                if(command["type"] == "alias"){
                  var alias = command["alias"];
                  var command = commands[alias];
                }
                if(command != undefined){
                  runCommand(command, message, args);
                }else{
                  bot.sendMessage(message.author, message.author.mention() + " Unknown command! Type \"" + botMention + " help\" for help!");
                }
              }else{
                bot.deleteMessage(message);
                bot.sendMessage(message.author, message.author.mention() + " Unknown command! Type \"" + botMention + " help\" for help!");
              }
          }
        }
      }else{
        bot.sendMessage(message.author, "You can't execute commands from PM!");
      }
    }
  }
});

function removeRepeat(user, role){
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
}

function addRepeat(user, role){
  if(!(bot.memberHasRole(user,role))){
    bot.addMemberToRole(user, role, function(error){
      //log("Adding role " + role.name + " to " + user.name);
      if(error != null){
        //log("Error adding role: " + error);
      }else{
        //log("Added role successfully!");
        setTimeout(function(){
          if(!(bot.memberHasRole(user, role))){
            //log("Role was apparently not added. adding again.");
            addRepeat(user, role);
          }
        }, 100);
      }
    });
  }
}

bot.on("voiceLeave", function(channel, user){
  //log("User " + user.name + " left channel " + channel.name);
  try{
    if(channel.members.length == 0 && channels[channel.name]["type"] == "temp"){
      log("Deleted temporary channel " + channel.name + ", because it is empty.");
      bot.deleteChannel(channel);
    }
  }catch(e){
    if(e){
      log(e);
    }
  }
  /*if(channel.name in channels){
    roleToRemove = channel.server.roles.get("id",channels[channel.name]["role"]);
    bot.removeMemberFromRole(user, roleToRemove, function(error){
      log("Removing role " + roleToRemove.name + " from " + user.name);
      if(error != null){
        log("Error removing role: " + error);
      }else{
        log("Removed role successfully!");
        if(memberHasRole(user, roleToRemove)){
          removeRepeat(user, roleToRemove);
        }
      }
    });
    removeRepeat(user, roleToRemove);
  }*/
});

bot.on("voiceJoin", function(channel, user){
  //log("User " + user.name + " joined channel " + channel.name);
  if(channel.name in channels){
      if(channels[channel.name]["type"] == "temp" && channels[channel.name]["activated"] == false){
        channels[channel.name]["activated"] = true;
      }
      //roleToAdd = channel.server.roles.get("id",channels[channel.name]["role"]);
      /*bot.addMemberToRole(user, roleToAdd, function(error){
        log("Adding role " + roleToAdd.name + " to " + user.name);
        if(error != null){
          log("Error adding role: " + error);
        }else{
          log("Added role successfully!");
        }
      });*/
      //addRepeat(user, roleToAdd);
  }

});

bot.on("channelCreated", function(channel){
  //Just in case someone creates a new text channel.
  if(channel.type == "voice"){
    //If it isn't a temp channel the bot made and doesn't already exist in the channel array.
    if(!(channel.name in channels) && madeByBot == false){
      channels[channel.name] = {
        "type": "perm",
        "creator": "none"
      }
      printChannels();
      updateConfig();
      log("Channel " + channel.name + " has been created, assumed to be permanent.");
    }

  }
});

bot.on("channelDeleted", function(channel){
  if(channel.name in channels && channel.type == "voice"){
    delete channels[channel.name];
    log("Deleted channel " + channel.name + " from array and config.");
    updateConfig();
  }
});


bot.on("disconnect", function(message){
  log("Disconnected from Discord. Attempting to reconnect...");
  login();
});

login();
