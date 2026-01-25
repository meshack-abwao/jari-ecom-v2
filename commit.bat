@echo off
cd /d C:\Users\ADMIN\Desktop\jari-ecom-v2
git add -A
git commit -m "Docs: Comprehensive handover Jan 25-26 + Formula 13 migration partial state"
git push origin main
git log --oneline -8
