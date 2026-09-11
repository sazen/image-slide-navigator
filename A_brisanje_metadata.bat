@echo off
title Popolno in NEPOVRATNO brisanje metapodatkov
chcp 65001 > nul

if "%~1"=="" (
    echo [NAPAKA] Prosim, povlecite PDF datoteko in jo spustite na to .bat ikono.
    pause
    exit /b
)

set "PDF_POT=%~1"
set "EXIFTOOL_POT=%~dp0exiftool.exe"
set "QPDF_POT=%~dp0qpdf.exe"
set "ZACASNA_POT=%~dp0temp_clean.pdf"

echo Izbrana datoteka: %PDF_POT%
echo.

echo 1. Brisanje skritih Windows sistemskih podatkov (NTFS Streams)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Unblock-File '%PDF_POT%'; Get-Item '%PDF_POT%' -Stream * | Where-Object { $_.Stream -ne ':$DATA' } | ForEach-Object { Remove-Item '%PDF_POT%' -Stream $_.Stream }"

echo.
echo 2. Skrivanje notranjih PDF metapodatkov (ExifTool)...
if exist "%EXIFTOOL_POT%" (
    "%EXIFTOOL_POT%" -all= -overwrite_original "%PDF_POT%"
) else (
    echo [OPOZORILO] exiftool.exe ni bil najden!
)

echo.
echo 3. TRAJNO uničenje starih podatkov z rekonstrukcijo datoteke (qpdf)...
if exist "%QPDF_POT%" (
    :: qpdf ustvari popolnoma novo strukturo brez zgodovine sprememb
    "%QPDF_POT%" --linearize "%PDF_POT%" "%ZACASNA_POT%"
    move /y "%ZACASNA_POT%" "%PDF_POT%" > nul
    echo Uspešno izvedeno! Metapodatkov ni več mogoče obnoviti.
) else (
    echo [OPOZORILO] qpdf.exe ni bil najden! Podatki so skriti, a forenzično še vedno obnovljivi.
)

echo.
echo Postopek je zaključen.
pause
