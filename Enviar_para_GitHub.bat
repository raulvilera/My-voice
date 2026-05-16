@echo off
set GIT_PATH="C:\Users\RAULPEREIRAVILERAJUN.AzureAD.001\AppData\Local\Programs\Git\cmd\git.exe"
echo Enviando atualizacoes para o GitHub...
cd /d "c:\Users\RAULPEREIRAVILERAJUN.AzureAD.001\Downloads\My-voice-updated (1)"
%GIT_PATH% add .
%GIT_PATH% commit -m "Implementar VideoEditor e sincronizar aulas"
%GIT_PATH% push origin main
echo.
echo Concluido! Suas aulas agora estao atualizadas no GitHub.
pause
