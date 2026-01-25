@echo off
cd /d C:\Users\ADMIN\Desktop\jari-ecom-v2
git add -A
git commit -m "C1.4-Block-product-creation-when-limit-reached-refresh-balance-on-changes"
git push origin main
git log --oneline -6
