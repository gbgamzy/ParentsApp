#!/bin/bash
cd /home/gautam/ParentsApp
git fetch origin

git reset --hard origin/main

systemctl daemon-reload
systemctl restart gunicorn.service

pm2 restart TeenCare

echo -n > /root/.pm2/logs/parents-out.log
echo -n > /root/.pm2/logs/parents-error.log


