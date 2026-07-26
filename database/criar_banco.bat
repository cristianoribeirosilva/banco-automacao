@echo off
echo Criando banco de dados railway...
mysql -u root -p < "%~dp0schema.sql"
echo.
echo Se nao houve erro, o banco foi criado com sucesso!
pause
