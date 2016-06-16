import discord
from discord.ext import commands
import datetime
import os
from random import randint
from .utils.dataIO import fileIO
from .utils import checks
import time



users = "data/rpg/users.json"

class Quest:
    def __init__(self, game):
        self.good_task = ["Save", "Find", "Locate", "Rescue", "Obtain", "Recover", "Discover", "Find the location of", "Discover the location of", "Search for"]
        self.good_modifier = ["Lost", "Scared", "Missing", "Endangered", "Stolen", "Kidnapped"]
        self.good_subject = ["Penguin", "Child", "Teddy Bear", "Toy", "Candy", "Treasure", "Puppy"]
        
        self.bad_task = ["Kill", "Attack", "Destroy", "Decapitate", "Assassinate", "Execute", "Find the hideout of"]
        self.bad_modifier = ["Evil", "Murderous", "Psychotic", "Bloodlusted", "Rogue"]
        self.bad_subject = ["Bear", "Necromancer", "Wizard", "Knight", "Archer", "Assassin"]
        
        self.game = game
        
    def generateGoodQuest(self):
        rand_task = randint(0, len(self.good_task)-1)
        rand_modifier = randint(0, len(self.good_modifier)-1)
        rand_subject = randint(0, len(self.good_subject)-1)
        rand_values = [rand_task, rand_modifier, rand_subject]
        rand_danger = randint(1, 4)
        
        attributes = [self.good_task[rand_task], self.good_modifier[rand_modifier], self.good_subject[rand_subject]]
        return {
            "description": "{} the {} {}!".format(attributes[0], attributes[1], attributes[2]), 
            "rand_quest": [rand_task, rand_modifier, rand_subject],
            "danger": rand_danger,
            "type": "Good",
            "name": self.generateQuestName(attributes, "Good")
        }
        
    def generateBadQuest(self):
        rand_task = randint(0, len(self.bad_task)-1)
        rand_modifier = randint(0, len(self.bad_modifier)-1)
        rand_subject = randint(0, len(self.bad_subject)-1)
        rand_danger = randint(5, 10)
        
        attributes = [self.bad_task[rand_task], self.bad_modifier[rand_modifier], self.bad_subject[rand_subject]]
        return {
            "description": "{} the {} {}!".format(attributes[0], attributes[1], attributes[2]), 
            "rand_quest": [rand_task, rand_modifier, rand_subject],
            "danger": rand_danger,
            "type": "Bad",
            "name": self.generateQuestName(attributes, "Bad"),
            "reward": rand_danger * randint(100, 300)
        }
    def generateQuestName(self, attribute, type):
        adjective = []
        prefix = ["Journey", "Adventure", "Quest", "Expedition", "Voyage"]
        if type == "Bad":
            adjective = ["Frenzy", "Chaos", "Attack", "Rampage", "Mayhem"]
        elif type == "Good":
            adjective = ["Rescue", "Search", "Adventure", "Journey", "Return", "Hero"]
        
        if randint(0, 5) <= 1:
            attribute[1] = ""
        else:
            attribute[1] += " "    
        
        rand_name = randint(0, 40)
        rand_adjective = adjective[randint(0,len(adjective)-1)]
        rand_prefix = prefix[randint(0,len(prefix)-1)]
        if rand_name > 30:
            return "{}{} {}".format(attribute[1], attribute[2], rand_adjective)
        elif rand_name > 20:
            return "{}{}'s {}".format(attribute[1], attribute[2], rand_adjective)
        elif rand_name > 10:
            return "{} to {} the {}{}".format(rand_prefix, attribute[0], attribute[1], attribute[2])
        else:
            return "{} of the {}{}".format(rand_adjective, attribute[1], attribute[2])
                
    def getQuest(self):
        if randint(0, 1) == 0:
            return self.generateGoodQuest()
        else:
            return self.generateBadQuest()
    
    def getQuestList(self, count):
        quests = []
        for i in range(count):
            quests.append(self.getQuest())
        return quests
        
    def getQuestElementsFromQuest(self, quest):
        if quest["type"] == "Bad":
            return [self.bad_task[quest["rand_values"][0]], self.bad_modifier[quest["rand_values"][1]], self.bad_subject[quest["rand_values"][2]]]
        elif quest["type"] == "Good":
            
        
    
                
#END QUEST CLASS
roles = {
            "Ranger": {
                "description": "Rangers use the mighty power of the bow and arrow to wreak havoc on enemies from afar.",
                "type": "Ranged",
                "health": 90,
                    "damage": 10
            },
            "Rogue": {
                "description": "Trained in the art of combat, Rogues fight enemies with both a katana and razor-sharp shurikens.",
                "type": "Melee & Ranged",
                "health": 85,
                "damage": 13
            },
            "Mage": {
                "description": "Having studied in the Citadel of the Magus, Mages cast spells to fight enemies or help allies.",
                "type": "Ranged",
                "health": 70,
                "damage": 18
            },
            "Warrior": {
                "description": "With the experience of countless battles, Warriors use their sword to hack and slash their way throuh enemies.",
                "type": "Melee",
                "health": 100,
                "damage": 15,
            }
        }
        
#START GAME CLASS
class Game:
    def __init__(self, bot):
        self.rolesList = self.getRolesList()
        self.quest = Quest(self)
        self.users = fileIO(users, "load")
        self.bot = bot
        self.available_quests = self.quest.getQuestList(5)
        self.quest_gen_time = datetime.datetime.now()
        
    def getGameTime(self):
        now = datetime.datetime.now()
        return int(((now.minute/60)+(now.second/60/60)) * 2400)
    def getReadableGameTime(self):
        gameTime = self.getGameTime()
        readableTime = gameTime
        hour = 0
        minute = 0
        past_noon = False
        if gameTime >= 1300:
            readableTime -= 1200
            past_noon = True
        if readableTime > 100 :
            hour = str(readableTime)[:(len(str(readableTime)) - 2)]
        else:
            hour = 12
        minute = str(readableTime)[(len(str(readableTime)) - 2):]
        readableString = "%s:%s" % (hour, minute)
        if not past_noon:
            readableString += " AM"
        else:
            readableString += " PM"
        return readableString
        
    def getRolesList(self):
        content = "-"*15 + "\nChatRPG Roles\n" + "-"*15 + "\n"    
        for role in roles:
            content += "%s:\n" % (role)
            content += "    Description: '%s'\n" % (roles[role]["description"])
            content += "    Type: '%s'\n" % (roles[role]["type"])
            content += "    Base Health: %s\n" % (roles[role]["health"])
            content += "    Damage: %s" % (roles[role]["damage"])
            content += "\n"
        return "```python\n" + content + "\n```"
    
    def getStats(self, stats_list, user : discord.Member):
        content = "Stats:\n".format(user.mention)
        content += "    Gold: {}\n".format(stats_list[user.id]["gold"])
        content += "    Health: {}\n".format(stats_list[user.id]["health"])
        content += "    Level: {}\n".format(stats_list[user.id]["level"])
        return "```python\n" + content + "\n```"
    
    def getRequiredXP(self, level):
        required_xp = int(100*(1.25**(int(level)-1)))
        return required_xp
    
    def getRemainingXP(self, level : int, xp : int):
        return self.getRequiredXP(level) - xp
        
    def getPlayerLevel(self, player_data):
        xp = int(player_data["xp"])
        level = int(player_data["level"])
        if level < 100:
            required_xp = self.getRequiredXP(level)
            remainder = self.getRemainingXP(level, xp)
            
            if(xp >= required_xp):
                level += 1
                remainder = self.getRemainingXP(level, xp)
                return [True, level, remainder]
            else:    
                return [False, level, remainder]
        else:
            return [False, level, None]
                
#END GAME CLASS

#START CHATRPG CLASS
class ChatRPG:
    def __init__(self, bot):
        self.bot = bot
        self.game = Game(bot)
        self.prefix = "**ChatRPG>**"
    
    #RPG COMMANDS
    @commands.group(name="rpg", pass_context=True)
    async def _rpg(self, ctx):
        user = ctx.message.author
        if ctx.invoked_subcommand is None:
            await self.bot.say("{} {} you have not entered a sub-command!".format(self.prefix, user.mention))
    #RPG - TIME COMMAND
    @_rpg.command(pass_context=False)
    async def time(self):
        gameTime = self.game.getReadableGameTime()
        await self.bot.say("{} Current game time: {}".format(self.prefix, gameTime))
    #RPG - ROLES LIST COMMAND
    @_rpg.command(pass_context=True)
    async def roles(self, ctx):
        await self.bot.say(self.game.rolesList)
    
    #RPG - SET ROLE COMMAND
    @_rpg.command(pass_context=True)
    async def role(self, ctx, role):
        upper_roles = [role.upper() for role in roles]
        user = ctx.message.author
        if role.upper() in upper_roles:
            if not user.id in self.game.users:
                self.game.users[user.id] = {
                    "name": user.name,
                    "role": role,
                    "level": 1,
                    "xp": 0,
                    "gold": 100,
                    "health": 100,
                    "reset": 0
                }
                fileIO(users, "save", self.game.users)
                await self.bot.say("{} {} Your role has been set to '{}'".format(self.prefix, user.mention, role))
                await self.bot.whisper("Welcome to **ChatRPG**! You have just taken your first step into the mighty realm of Rabbitlandia! As a {}, you will take quests, fight terrifying monsters, and team up with your friends to become the most powerful {} in the realm!\nYour beginning stats: {}".format(role, role, self.game.getStats(self.game.users, user)))
            else:
                await self.bot.say("{} {} Your role has already been set!".format(self.prefix, user.mention))
        else:
            await self.bot.say("{} {} that role does not exist!".format(self.prefix, user.mention))
    #RPG - RESET PROGRESS COMMAND
    @_rpg.command(pass_context=True)
    async def reset(self, ctx):
        user = ctx.message.author
        if user.id in self.game.users:
            now = time.time()
            await self.bot.say((now - self.game.users[user.id]["reset"])/60.0)
            if self.game.users[user.id]["reset"] == 0:
                self.game.users[user.id]["reset"] = now
                await self.bot.say("{} {} are you sure? You will permanently lose all RPG progress. Type *!rpg reset* again in the next 5 minutes to confirm.".format(self.prefix, user.mention))
            else:
                if (now - self.game.users[user.id]["reset"])/60.0 <= 1.0:
                    self.game.users[user.id]["reset"] = 0
                    del self.game.users[user.id]
                    await self.bot.say("{} {} your progress has been reset. Type *!rpg role <role>* to restart your journey.".format(self.prefix, user.mention))
                else:
                    self.game.users[user.id]["reset"] = 0
                    self.reset(self, ctx)
        else:
            await self.bot.say("{} {} You are not registered, so you can't reset!".format(self.prefix, user.mention))
    @_rpg.command(pass_context=True)
    async def stats(self, ctx):
        user = ctx.message.author
        if user.id in self.game.users:
            await self.bot.say(self.game.getStats(self.game.users, user))
        else:
            await self.bot.say("{} User does not exist or is not registered!".format(prefix))
                
    @_rpg.command(pass_context=True)
    async def quest(self, ctx):
        content = ""
        count = 1
        for quest in self.available_quests:
            content += "Quest {}: '{}'\n".format(count, quest["name"])
            content += "    Description: '{}'\n".format(quest["description"])
            content += "    Danger: {}\n".format(quest["danger"])
            #content += "    Reward: {}\n".format(quest["reward"])
            content += "\n"
            count += 1
        await self.bot.say("```java\n{}\n```".format(content))
    @_rpg.command(pass_context=True)
    async def get_xp(self, ctx):
        user = ctx.message.author
        
        levelup = self.game.getPlayerLevel(self.game.users[user.id])
        await self.bot.say(self.game.users[user.id])
        times_leveled = 0
        while levelup[0] == True:
            times_leveled += 1
            self.game.users[user.id]["level"] = int(self.game.users[user.id]["level"]) + 1
            fileIO(users, "save", self.game.users)
            await self.bot.say("{} {} **LEVEL UP!** You have reached level {}.".format(self.prefix, user.mention, levelup[1], levelup[2], levelup[1]+1))
            levelup = self.game.getPlayerLevel(self.game.users[user.id])
        await self.bot.say("{} {} Level {}/100 \n{}{} Remaining for next level".format(self.prefix, user.mention, self.game.users[user.id]["level"], " "*(len(self.prefix) + len(user.name)+2), self.game.getRemainingXP(int(self.game.users[user.id]["level"]), int(self.game.users[user.id]["xp"]))))   
    
    @commands.command(pass_context=True)
    async def s_debug(self, ctx):
        await self.game.quest.getBadQuest()
             
    @commands.command(pass_context=True)
    @checks.is_owner()
    async def modify_stat(self, ctx, user : discord.Member, stat, value):
        user_stats = self.game.users[user.id]
        if user.id in self.game.users:
            if stat in self.game.users[user.id]:
                await self.bot.say("{}'s {} Before: {}".format(user.name, stat, user_stats[stat]))
                user_stats[stat] = value
                fileIO(users, "save", self.game.users)
                await self.bot.say("{}'s {} After: {}".format(user.name, stat, value))
            else:
                await self.bot.say("Invalid Stat.")
        else:
            await self.bot.say("Invalid User.")
    
    async def on_member_update(self, before, after):
        if after.id in self.game.users:
            if not self.game.users[after.id]["name"] == after.name:
                self.game.users[after.id]["name"] = after.name
                fileIO(users, "save", self.game.users)
#END CHATRPG CLASS

def check_folder():
	if not os.path.exists("data/rpg"):
		print("\033[1mChatRPG>\033[0m Creating data/rpg folder...")
		os.makedirs("data/rpg")
def check_file():
	if not fileIO(users, "check"):
		print("\033[1mChatRPG>\033[0m Creating blank users.json...")
		fileIO(users, "save", {})

def setup(bot):
	check_folder()
	check_file()
	bot.add_cog(ChatRPG(bot))