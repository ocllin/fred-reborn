@echo off
title Fred Bot Startup Script
echo Attempting to start Fred Bot
echo ==============================
cmd /k pm2 start src/index.js --cron-restart="0 1 * * *"
echo Fred Bot running successfully on pm2