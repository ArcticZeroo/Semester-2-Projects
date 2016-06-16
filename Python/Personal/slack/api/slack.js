this.slack = function(token){return new SlackAPI(token)}

var r = require('request');
var WebSocketClient = require('websocket').client;
var socket = new WebSocketClient();
var EventEmitter = require('events');
var log = require("../logger.js").logger();

var base_url = "https://slack.com/api/";

class Info{
    setUserID(id){
        this.userID = id;
    }
    getUserID(){
        return this.userID;
    }
    
    setUserName(name){
        this.userName = name;
    }
    getUserName(){
        return this.userName;
    }
    setTeamID(id){
        this.teamID = id;
    }
    getTeamID(){
        return this.teamID;
    }
    
    setTeamName(name){
        this.teamName = name;
    }
    getTeamName(){
        return this.teamName;
    }
}

class Utils{
    constructor(){
        this.token;
        this.rtm;
    }
    
    setToken(token){
        this.token = token;
    }
    
    getToken(){
        return this.token;
    }
    
    createRequestURL(method, args){
        args = args || [];
        var request_url = base_url + method;
        var request_args = [];
        for(var i = 0; i < args.length; i++){
            if(args[i].value){
                request_args.push(args[i].arg + "=" + encodeURIComponent(args[i].value));      
            }
        }
        if(request_args.length > 0){
            request_url += "?" + request_args.join("&");   
        }
        //console.log(request_url);
        return request_url;
    }
    
    get(url, callback){
        //console.log("Making request at url " + url);
        r(url, (error, response, body) =>{
            if(!error){
                var bodyParse = JSON.parse(body);
                callback(bodyParse);    
            }else{
                log.logError("Request returned an error: " + error, "slack/Utils.get()");
            }
        });
    }
    
    makeRequest(method, args, callback){
        var request_url = this.createRequestURL(method, args);
        var request_response = this.get(request_url, (body)=>{
            callback(body);
        });
    }
    
}

class Events extends EventEmitter{
    emitEvent(event){
        event = JSON.parse(event);
        var type = event.type;
        //log.logDebug("Emitting event of type " + event.type + " with content " + event);
        this.emit(event.type, event);
        this.emit('all', event);
    }
}

var utils = new Utils();
var events = new Events();
var info = new Info();

class API{
    test(callback, error, foo){
        //Tests to make sure the API works properly.
        //error: Error response to return
        //foo: example property to return
        error = {arg: "error", value: error} || undefined;
        foo = {arg: "foo", value: foo} || undefined;
        return utils.makeRequest("api.test", [error, foo], callback);
    }
}

class Auth{
    revoke(callback, test){
        //Revokes access to a token.
        //token: Auth token
        //test: Setting to 1 triggers testing mode where it's NOT revoked.
        var token = {arg: "token", value: token} || undefined;
        test = {arg: "test", value: test} || undefined;
        return utils.makeRequest("auth.revoke", [token, test], callback);
    }
    test(callback, token){
        //This method checks authentication and tells you who you are.
        //token: Auth token
        var token = {arg: "token", value: utils.getToken()};
        return utils.makeRequest("auth.test", [token], callback);
    }
}

class Bots{
    info(callback, bot){
        //This method returns information about a bot user.
        //token: Auth token
        //bot: Bot user to get info on
        var token = {arg: "token", value: utils.getToken()};
        bot = {arg: "bot", value: bot} || undefined;
        return utils.makeRequest("bots.info", [token, bot], callback);
    }
}

class Channels{
    archive(callback, channel){
        //This method archives a channel.
        //token: Auth token
        //channel: Channel to archive
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        channel = {arg: "channel", value: channel};
        return utils.makeRequest("channels.archive", [token, bot], callback);
    }
    create(callback, name){
        //This method is used to create a channel.
        //token: Auth token
        //name:  Name of channel to create
        if(name == undefined){
            throw new TypeError("Argument 'name' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        name = {arg: "name", value: name};
        return utils.makeRequest("channels.create", [token, name], callback);
    }
    history(callback, channel, latest, oldest, inclusive, count, unreads){
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        channel = {arg: "channel", value: channel};
        latest = {arg: "latest", value: latest} || undefined;
        oldest = {arg: "oldest", value: oldest} || undefined;
        inclusive = {arg: "inclusive", value: inclusive} || undefined;
        count = {arg: "count", value: count} || undefined;
        unreads = {arg: "unreads", value: unreads} || undefined;
        return utils.makeRequest("channels.history", [token, channel, latest, oldest, inclusive, count, unreads], callback);
    }
    create(callback, channel){
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        channel = {arg: "channel", value: channel};
        return utils.makeRequest("channels.create", [token, channel], callback);
    }
    invite(callback, channel, user){
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        if(user == undefined){
            throw new TypeError("Argument 'user' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        channel = {arg: "channel", value: channel};
        user = {arg: "user", value: user};
        return utils.makeRequest("channels.invite", [token, channel, user], callback);
    }
    join(callback, name){
        if(name == undefined){
            throw new TypeError("Argument 'name' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        name = {arg: "name", value: name};
        return utils.makeRequest("channels.join", [token, name], callback);
    }
    kick(callback, channel, user){
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        if(user == undefined){
            throw new TypeError("Argument 'user' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        channel = {arg: "channel", value: channel};
        user = {arg: "user", value: user};
        return utils.makeRequest("channels.kick", [token, channel, user], callback);
    }
    leave(callback, channel){
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        channel = {arg: "channel", value: channel};
        return utils.makeRequest("channels.leave", [token, channel], callback);
    }
    list(callback, exclude_archived){
        var token = {arg: "token", value: utils.getToken()};
        exclude_archived = {arg: "exclude_archived", value: exclude_archived};
        return utils.makeRequest("channels.list", [token, exclude_archived], callback);
    }
    mark(callback, channel, ts){
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        if(ts == undefined){
            throw new TypeError("Argument 'ts' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        channel = {arg: "channel", value: channel};
        ts = {arg: "ts", value: ts};
        return utils.makeRequest("channels.mark", [token, channel, ts], callback);
    }
    rename(callback, channel, name){
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        if(name == undefined){
            throw new TypeError("Argument 'name' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        channel = {arg: "channel", value: channel};
        name = {arg: "name", value: name};
        return utils.makeRequest("channels.rename", [token, channel, name], callback);
    }
    setPurpose(callback, channel, purpose){
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        if(purpose == undefined){
            throw new TypeError("Argument 'purpose' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        channel = {arg: "channel", value: channel};
        purpose = {arg: "purpose", value: purpose};
        return utils.makeRequest("channels.setPurpose", [token, channel, purpose], callback);
    }
    setTopic(callback, channel, topic){
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        if(topic == undefined){
            throw new TypeError("Argument 'topic' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        channel = {arg: "channel", value: channel};
        topic = {arg: "topic", value: topic};
        return utils.makeRequest("channels.setTopic", [token, channel, topic], callback);
    }
    unarchive(callback, channel){
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        channel = {arg: "channel", value: channel};
        return utils.makeRequest("channels.unarchive", [token, channel], callback);
    }
}

class Chat{
    delete(callback, ts, channel, as_user){
        if(ts == undefined){
            throw new TypeError("Argument 'ts' required, not defined.");
        }
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        ts = {arg: "ts", value: ts};
        channel = {arg: "channel", value: channel};
        as_user = {arg: "as_user", value: as_user} || undefined;
        return utils.makeRequest("chat.delete", [token, channel], callback);
    }
    meMessage(callback, channel, text){
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        if(text == undefined){
            throw new TypeError("Argument 'text' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        channel = {arg: "channel", value: channel};
        text = {arg: "text", value: text};
        return utils.makeRequest("chat.meMessage", [token, channel, text], callback);
    }
    postMessage(callback, channel, text, parse, link_names, attachments, unfurl_links, unfurl_media, username, as_user, icon_url, icon_emoji){
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        if(text == undefined){
            throw new TypeError("Argument 'text' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        channel = {arg: "channel", value: channel};
        text = {arg: "text", value: text};
        parse = {arg: "parse", value: parse} || undefined;
        link_names = {arg: "link_names", value: link_names} || undefined;
        attachments = {arg: "attachments", value: attachments} || undefined;
        unfurl_links = {arg: "unfurl_links", value: unfurl_links} || undefined;
        unfurl_media = {arg: "unfurl_media", value: unfurl_media} || undefined;
        username = {arg: "username", value: username} || undefined;
        as_user = {arg: "as_user", value: as_user} || undefined;
        icon_url = {arg: "icon_url", value: icon_url} || undefined;
        icon_emoji = {arg: "icon_emoji", value: icon_emoji} || undefined;
        return utils.makeRequest("chat.postMessage", [token, channel, text, parse, link_names, attachments, unfurl_links, unfurl_media, username, as_user, icon_url, icon_emoji], callback);
    }
    update(callback, ts, channel, text, attachments, parse, link_names, as_user){
        if(ts == undefined){
            throw new TypeError("Argument 'ts' required, not defined.");
        }
        if(channel == undefined){
            throw new TypeError("Argument 'channel' required, not defined.");
        }
        if(text == undefined){
            throw new TypeError("Argument 'text' required, not defined.");
        }
        var token = {arg: "token", value: utils.getToken()};
        ts = {arg: "ts", value: ts};
        channel = {arg: "channel", value: channel};
        text = {arg: "text", value: text};
        parse = {arg: "parse", value: parse} || undefined;
        link_names = {arg: "link_names", value: link_names} || undefined;
        attachments = {arg: "attachments", value: attachments} || undefined;
        as_user = {arg: "as_user", value: as_user} || undefined;
        return utils.makeRequest("chat.update", [token, ts, channel, text, attachments, parse, link_names, as_user], callback);
    }
}

class RTM extends EventEmitter {
    start(simple_latest, no_unreads, npim_aware){
        var callback = (response)=>{this.init(response)};
        var token = {arg: "token", value: utils.getToken()};
        simple_latest = {arg: "simple_latest", value: simple_latest} || undefined;
        no_unreads = {arg: "no_unreads", value: no_unreads} || undefined;
        npim_aware = {arg: "npim_aware", value: npim_aware} || undefined;
        return utils.makeRequest("rtm.start", [token, simple_latest, no_unreads, npim_aware], callback);
    }
    
    init(response){
        if(response.url){
            info.setUserID(response.self.id);
            info.setUserName(response.self.name);
            info.setTeamID(response.team.id);
            info.setTeamName(response.team.name);
            this.connect(response.url);
        }
    }
    
    connect(url){
        socket.connect(url);
        socket.on('connect', (connection)=>{
            //var connectEvent = { type: 'utf8', utf8Data: '{"type":"connect"}' }
            //events.emitEvent(connectEvent.utf8Data);
            connection.on('message', (message)=>{
               //console.log(message);
               if(message.type == 'utf8'){
                    events.emitEvent(message.utf8Data);     
               }
            });
            connection.on('error', (error)=>{
               log.logError("Error in connection to RTM server: " + error, "slack/RTM.connect()"); 
            });
            connection.on('close', ()=>{
               log.logInfo("Rtm connection closed.", "slack/RTM.connect()"); 
            });
            setTimeout(()=>{
                if(!connection.connected){
                    log.logError("Restarting bot after waiting 20 seconds with no response from server...");
                    process.exit();
                }
            })
        });
    }
}

class SlackAPI{
    constructor(token){
        utils.setToken(token);
        this.api = new API();
        this.auth = new Auth();
        this.bots = new Bots();
        this.channels = new Channels();
        this.chat = new Chat();
        this.events = events;
        this.info = info;
        this.rtm = new RTM();
        this.utils = utils;
    }
    
}