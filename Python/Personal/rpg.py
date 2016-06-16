import discord
import os
from .utils.dataIO import fileIO

stats = "data/rpg/stats.json"

class ChatRPG:
    def __init__(self, bot):
        self.bot = bot
        self.stats = fileIO(stats, "load")
    @commands.group(name="rpg", pass_context=True)
    async def _rpg(self, ctx):
    
    @_rpg.command(pass_context=True)
    async def role(self, ctx, role):
        roles = ["WARRIOR", "ROGUE", "MAGE", "RANGER"]
        if role.upper() in roles
            user = ctx.message.author
            if not user.id in self.stats:
                self.stats[user.id] = role
                await self.bot.say("{} Your role has been set to {}".format(user.mention, role))
        else:
            await self.bot.say("{} that role does not exist!".format(user.mention))