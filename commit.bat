@echo off
cd /d C:\Users\ADMIN\Desktop\jari-ecom-v2
git add -A
git commit -m "Fix: Migration 009 - DROP and recreate tables to fix partial state error"
git push origin main
git log --oneline -5
