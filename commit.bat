@echo off
cd /d C:\Users\ADMIN\Desktop\jari-ecom-v2
git add -A
git commit -m "Fix: cards.js and templates.js - correct imports (auth, db) and req.user.userId"
git push origin main
git log --oneline -5
