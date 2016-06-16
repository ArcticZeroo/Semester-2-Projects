from slackclient import SlackClient
import  os
import time
import sys
import datetime

command_prefix = "!"
prefix = "@RC"
def getConsoleTimestamp():
    time = datetime.datetime.now()
    return "[%s/%s/%s %s:%s:%s]" % (str(time.month), str(time.day), str(time.year), str(time.hour), str(time.minute), str(time.second))

class SlackUtils(object):
    def __init__(self, client, token):
        print ("{} Connecting to Slack...".format(getConsoleTimestamp()))
        self.client = client
        self.token = token
        self.connect()
        self.user = self.getCurrentAuthenticatedUser()
    
    def connect(self):
        if self.client.rtm_connect():
            print("{} Connected to slack!".format(getConsoleTimestamp()))
        else:
            print("{} Connection failed :(".format(getConsoleTimestamp()))
    
    def checkAuth(self):
        response = self.client.api_call('auth.test', token=self.token)
        return response
    
    def getCurrentAuthenticatedUser(self):
        return self.checkAuth()["user"]
    
    def getEvents(self):
        return self.client.rtm_read()
   
    def getMessageEvents(self):
        events = self.getEvents()
        messages = []
        if len(events) > 0:
            for event in events:
                if event["type"] == "message" and "text" in event and "user" in event and "ts" in event:
                    #print(event)
                    if event["user"] != self.user:
                        messages.append(event)
            if len(messages) > 0:
                return messages
            else:
                return False
        else:
            return False
    
    def getUsernameFromId(self, id):
        response = self.client.api_call("users.info", token=self.token, user=id)
        user = response["user"]
        if "name" in user:
            return user["name"]
        else:
            return False
    
    def getGroups(self):
        response = self.client.api_call("groups.list", token=self.token)
        return response["groups"]
    
    def sendMessage(self, channel, string):
        self.client.api_call("chat.postMessage", token=self.token, channel=channel, text=string)  

    def isAdmin(self, user):
        response = self.client.api_call("users.info", token=self.token, user=user)
        user = response["user"]
        if "is_admin" in user:
            if user["is_admin"]:
                return True
            else:
                return False
        else:
            return False
            
    def isOwner(self, user):
        response = self.client.api_call("users.info", token=self.token, user=user)
        user = response["user"]
        if "is_owner" in user:
            if user["is_owner"]:
                return True
            else:
                return False
        else:
            return False
    
    def hasPerms(self, user):
        rcList = getRCList()
        username = self.getUsernameFromId(user)
        if username in rcList or self.isAdmin(user) or self.isOwner(user):
            return True
        else:
            return False

class CommandUtils(object):
    def __init__(self, client, token, slack):
        self.commands = Commands(client, token, slack)
        self.slack = slack
        self.client = client
        self.token = token
        
    def parseArgs(self, arguments):
        args = arguments.split(" ")
        if len(args[0]) > 1:
            args[0] = args[0][1:]
        else:
            args[0] = ""
        return args
        
    def runCommand(self, message):
        args = self.parseArgs(message["text"])
        if args[0] != "":
            method = None
            try:
                method = getattr(self.commands, args[0])
            except Exception as exception:
                self.client.api_call("chat.postMessage", token=self.token, channel=message['channel'], text="Invalid command entered!")
                return False
            else:
                method(args, message)
        else:
            self.client.api_call("chat.postMessage", token=self.token, channel=message['channel'], text="No command entered.")
        
class Commands(object):
    def __init__(self, client, token, slack):
        self.client = client
        self.token = token
        self.slack = slack
    
    def restart(self, args, message):
        channel = message['channel']
        if self.slack.hasPerms(message['user']):
            self.client.api_call("chat.postMessage", token=self.token, channel=channel, text="Restarting. Be back in a jiffy!")
            sys.exit()
        
    def rc(self, args, message):
        channel = message['channel']
        rcList = getRCList()
        if self.slack.hasPerms(message['user']):
            if len(args) > 1:
                if args[1] == "add":
                    if len(args) == 3:
                        rcList.append(args[2])
                        with open("rc.txt", "r+") as rc_list:
                            rc_list.write(str(rcList))
                        self.client.api_call("chat.postMessage", token=self.token, channel=channel, text="Successfully added {} to the RC List!".format(args[2]))
                    else:
                        self.client.api_call("chat.postMessage", token=self.token, channel=channel, text="Incorrect Arguments!")
                elif args[1] == "remove":
                    if len(args) == 3:
                        if args[2] in rcList:
                            rcList.remove(args[2])
                            os.remove("rc.txt")
                            with open("rc.txt", "a+") as rc_list:
                                rc_list.write(str(rcList))
                            self.client.api_call("chat.postMessage", token=self.token, channel=channel, text="Successfully removed {} from the RC List!".format(args[2]))
                        else:
                            self.client.api_call("chat.postMessage", token=self.token, channel=channel, text="{} is not on the RC List!".format(args[2]))
                    else:
                        self.client.api_call("chat.postMessage", token=self.token, channel=channel, text="Incorrect Arguments!")
                elif args[1] == "list":
                    if len(args) == 2:
                        members = "```\n"
                        members += "Rules Committee Members:\n"
                        for rc_member in rcList:
                            members += "{}\n".format(rc_member)
                        members += "```"
                        self.client.api_call("chat.postMessage", token=self.token, channel=channel, text=members)
                    else:
                        self.client.api_call("chat.postMessage", token=self.token, channel=channel, text="Incorrect Arguments!")    
                else:
                    self.client.api_call("chat.postMessage", token=self.token, channel=channel, text="The sub-command ```{}``` does not exist!".format(args[1]))
            else:
                self.client.api_call("chat.postMessage", token=self.token, channel=channel, text="No sub-command entered!")                         
   
class MentionBot(object):
    def __init__(self):
        self.token = 'xoxp-17416066709-18119173889-39039994132-3f0c7a4efc'
        self.client = SlackClient(self.token)
        self.slack = SlackUtils(self.client, self.token)
        self.commands = CommandUtils(self.client, self.token, self.slack)
        self.recent_messages = None
        self.messageListen()
        self.last_time = None
        
    
    def refreshMessages(self):
        self.recent_messages = self.slack.getMessageEvents()
        
    def isCommand(self, messages):
        for message in messages:
            text = message["text"]
            if text[0:1] == command_prefix:
                return (True, message)
        else:
            return (False, {})
    
    def commandListen(self):
        messages = self.recent_messages
        if messages != False:
            checkCommand = self.isCommand(messages)
            if checkCommand[0]:
                time = checkCommand[1]['ts']
                if not self.checkSameTime(time):
                    print("{} {} ran the command {}.".format(getConsoleTimestamp(), self.slack.getUsernameFromId(checkCommand[1]['user']), checkCommand[1]['text']))
                    self.logTime(time)
                    self.commands.runCommand(checkCommand[1])
        else:
            return (False, {})
            
    
    def startsWithPrefix(self):
        messages = self.recent_messages
        if messages != False:
            for message in messages:
                text = message["text"]
                if text[0:len(prefix)].upper() == prefix:
                    return (True, message)
            else:
                return (False, {})
        else:
            return (False, {})
            
    def logTime(self, time):
        with open('time.txt', 'r+') as f:
            f.write(time)
            
    def checkSameTime(self, time):
        with open('time.txt', 'r+') as f:
            oldTime = f.read()
            if oldTime == time:
                return True
            else:
                return False    
    
    def respondToMessages(self):
        message = self.startsWithPrefix()
        if message[0]:
            time = message[1]['ts']
            if not self.checkSameTime(time):
                messageToSend = ""
                author = self.slack.getUsernameFromId(message[1]["user"])
                for user in getRCList():
                    if author != user:
                        messageToSend += "@" + user + " "
                messageToSend += "^"
                self.client.api_call('chat.postMessage', token=self.token, channel=message[1]['channel'],  text=messageToSend)
                self.logTime(time)
        else:
            return False
           
    def messageListen(self):
       while True: 
           self.refreshMessages()
           self.commandListen()
           self.respondToMessages()
           time.sleep(1)
         
def check_file():
	if not fileIO(data, "check"):
		print("{} Creating blank data.json...".format(getConsoleTimestamp()))
		fileIO(data, "save", {})
def getRCList():
    with open("rc.txt", "r+") as rclist:
        return eval(rclist.read())                 
               
bot = MentionBot()