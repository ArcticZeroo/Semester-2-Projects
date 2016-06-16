@Echo off
chcp 65001
:Start

node bot.js develop
timeout 2

goto Start