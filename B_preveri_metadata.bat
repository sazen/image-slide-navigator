@echo off
title Pregledovalnik PDF Metapodatkov (Drag and Drop)
chcp 65001 > nul

:: Preverjanje, ali je uporabnik dejansko spustil datoteko na ikono
if "%~1"=="" (
    echo [NAPAKA] Prosim, povlecite PDF datoteko in jo spustite na to .bat ikono.
    echo.
    pause
    exit /b
)

set "PDF_POT=%~1"
set "EXIFTOOL_POT=%~dp0exiftool.exe"

echo =======================================================================
echo               PREGLED METAPODATKOV ZA PDF DOKUMENT
echo =======================================================================
echo Datoteka: %PDF_POT%
echo.

echo [1/3] ANALIZA Z ORODJEM EXIFTOOL (Vsi notranji metapodatki)...
echo -----------------------------------------------------------------------
if exist "%EXIFTOOL_POT%" (
    "%EXIFTOOL_POT%" "%PDF_POT%"
) else (
    :: Poskus zagona, če je exiftool slučajno dodan globalno v PATH
    exiftool "%PDF_POT%" 2>nul || (
        echo [OPOZORILO] exiftool.exe ni bil najden v mapi skripte ali v PATH!
    )
)
echo.

echo [2/3] FORENZIČNA STRUKTURA PDF (Preverjanje zgodovine sprememb z qpdf)...
echo -----------------------------------------------------------------------
:: Preverimo, če qpdf javi kakšne napake ali opozorila o strukturi
qpdf --check "%PDF_POT%"
echo.

echo [3/3] SISTEMSKI WINDOWS IN NTFS PODATKI (Preko PowerShella)...
echo -----------------------------------------------------------------------
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$file = Get-Item '%PDF_POT%';" ^
    "$shell = New-Object -ComObject Shell.Application;" ^
    "$folder = $shell.NameSpace($file.DirectoryName);" ^
    "$item = $folder.ParseName($file.Name);" ^
    "0..100 | ForEach-Object {" ^
    "    $name = $folder.GetDetailsOf($folder.Items(), $_);" ^
    "    $val = $folder.GetDetailsOf($item, $_);" ^
    "    if ($val) { [PSCustomObject]@{ Id = $_; Lastnost = $name; Vrednost = $val } }" ^
    "} | Format-Table -AutoSize | Out-String -Width 4096"

echo =======================================================================
echo Pregled je zaključen.
echo =======================================================================
pause
