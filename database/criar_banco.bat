@echo off
echo Criando banco de dados banco_app...
mysql -u root -p < "%~dp0schema.sql"
echo.
echo Se nao houve erro, o banco foi criado com sucesso!
pause
