Add-Type -AssemblyName System.Drawing

$src = "C:\Users\RAULPEREIRAVILERAJUN.AzureAD.001\.gemini\antigravity\brain\ada1d3ea-8318-4f70-8a46-3afc2352b475\media__1780170069237.jpg"
$public = "c:\Users\RAULPEREIRAVILERAJUN.AzureAD.001\Desktop\My-voice-main\public"

# Certificar que as pastas existem
if (!(Test-Path $public)) {
    New-Item -ItemType Directory -Force -Path $public
}
if (!(Test-Path "$public\public")) {
    New-Item -ItemType Directory -Force -Path "$public\public"
}

# Copiar imagens originais diretamente
Copy-Item $src -Destination "$public\my_voice_default.png" -Force
Copy-Item $src -Destination "$public\my_voice_default_round.png" -Force
Copy-Item $src -Destination "$public\favicon.png" -Force
Copy-Item $src -Destination "$public\public\favicon.png" -Force

function Resize-Image {
    param(
        [string]$srcPath,
        [string]$destPath,
        [int]$width,
        [int]$height
    )
    $srcImage = [System.Drawing.Image]::FromFile($srcPath)
    $newImage = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($newImage)
    
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Desenhar com preenchimento limpo
    $graphics.DrawImage($srcImage, 0, 0, $width, $height)
    
    $newImage.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $newImage.Dispose()
    $srcImage.Dispose()
}

# Redimensionar para tamanhos específicos
Resize-Image -srcPath $src -destPath "$public\icon-48.png" -width 48 -height 48
Resize-Image -srcPath $src -destPath "$public\icon-180.png" -width 180 -height 180
Resize-Image -srcPath $src -destPath "$public\icon-192.png" -width 192 -height 192
Resize-Image -srcPath $src -destPath "$public\icon-512.png" -width 512 -height 512

Resize-Image -srcPath $src -destPath "$public\public\icon-180.png" -width 180 -height 180
Resize-Image -srcPath $src -destPath "$public\public\icon-192.png" -width 192 -height 192
Resize-Image -srcPath $src -destPath "$public\public\icon-512.png" -width 512 -height 512

Write-Host "Icons generated successfully!"
