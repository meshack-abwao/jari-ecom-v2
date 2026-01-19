@echo off
cd /d C:\Users\ADMIN\Desktop\jari-ecom-v2
git add -A
git commit -m "docs: Update handover v2.1 - JS isolation complete, render.js now 289 lines"
git push origin main
git log --oneline -5
