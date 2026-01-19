@echo off
cd /d C:\Users\ADMIN\Desktop\jari-ecom-v2
git status
echo.
echo === PUSHING TO ORIGIN ===
git push origin feature/template-isolation
echo.
echo === DONE ===
git log --oneline -5
