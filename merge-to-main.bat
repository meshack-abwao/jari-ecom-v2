@echo off
cd /d C:\Users\ADMIN\Desktop\jari-ecom-v2
echo === SWITCHING TO MAIN ===
git checkout main
echo.
echo === MERGING FEATURE BRANCH ===
git merge feature/template-isolation
echo.
echo === PUSHING TO MAIN ===
git push origin main
echo.
echo === DONE ===
git log --oneline -8
