# Panel Profits - ComicBase 4K Cover Bridge (PowerShell for Windows VM)
# Location: C:\Users\Public\Documents\Human Computing\Pictures

param (
    [string]$PicturesPath = "C:\Users\Public\Documents\Human Computing\Pictures",
    [string]$SupabaseUrl = "https://vbcmjmakluyjnsmisoth.supabase.co",
    [string]$SupabaseKey = ""
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   PANEL PROFITS // COMICBASE 4K COVER SOVEREIGN BRIDGE    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $PicturesPath)) {
    Write-Warning "Pictures folder not found at: $PicturesPath"
    $AlternativePath = "C:\ComicBase Pictures"
    if (Test-Path $AlternativePath) {
        $PicturesPath = $AlternativePath
        Write-Host "Found pictures at alternative path: $PicturesPath" -ForegroundColor Green
    } else {
        Write-Error "Could not find ComicBase pictures folder. Please verify the path in ComicBase."
        Exit 1
    }
}

Write-Host "Scanning cover image archives in: $PicturesPath ..." -ForegroundColor Yellow
$sampleFiles = Get-ChildItem -Path $PicturesPath -Filter "*.jpg" -Recurse -File | Select-Object -First 10

Write-Host "`nSample Cover Images Found:" -ForegroundColor Green
foreach ($file in $sampleFiles) {
    Write-Host "  -> $($file.FullName) ($([math]::Round($file.Length / 1KB, 1)) KB)" -ForegroundColor Gray
}

$totalImages = (Get-ChildItem -Path $PicturesPath -Filter "*.jpg" -Recurse -File | Measure-Object).Count
Write-Host "`nTotal High-Res Covers Ready on VM: $totalImages" -ForegroundColor Cyan
Write-Host "Ready for high-speed catalog bridging.`n" -ForegroundColor Green
