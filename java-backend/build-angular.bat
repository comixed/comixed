@echo off
cd ..\web-frontend
ng build -prod --output-path=..\java-backend\target\classes\static
