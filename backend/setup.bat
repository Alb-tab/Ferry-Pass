@echo off
REM Script para setup inicial do FerryPass

cd /d c:\Users\Gaby\Desktop\sistema\backend

echo.
echo ======================================
echo FerryPass - Setup Backend
echo ======================================
echo.

echo Instalando dependencias...
call npm install

echo.
echo Criando arquivo .env...
if not exist .env (
    copy .env.example .env
    echo .env criado! Configure suas credenciais SMTP se desejar enviar emails.
) else (
    echo .env ja existe, pulando...
)

echo.
echo Populando banco de dados com dados de teste...
call node seed.js

echo.
echo ======================================
echo Setup concluido!
echo ======================================
echo.
echo Credenciais de teste:
echo   Email: operador@ferrypass.com
echo   Senha: senha123
echo.
echo Iniciando servidor...
call npm run dev

pause
