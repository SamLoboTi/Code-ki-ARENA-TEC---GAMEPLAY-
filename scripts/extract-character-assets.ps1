$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path "R.png").Path
$outDir = Join-Path (Get-Location) "public\characters"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$characters = @(
  @{ Name = "goku"; X = 0; Y = 0 },
  @{ Name = "vegeta"; X = 1; Y = 0 },
  @{ Name = "gohan"; X = 2; Y = 0 },
  @{ Name = "trunks"; X = 4; Y = 0 },
  @{ Name = "piccolo"; X = 5; Y = 0 },
  @{ Name = "freeza"; X = 10; Y = 1 },
  @{ Name = "cell"; X = 0; Y = 6 },
  @{ Name = "majin-buu"; X = 12; Y = 4 },
  @{ Name = "beerus"; X = 12; Y = 1 }
)

$sheet = [System.Drawing.Bitmap]::new($sourcePath)
$tileWidth = [Math]::Floor($sheet.Width / 13)
$tileHeight = [Math]::Floor($sheet.Height / 8)

foreach ($character in $characters) {
  $crop = [System.Drawing.Rectangle]::new(
    $character.X * $tileWidth,
    $character.Y * $tileHeight,
    $tileWidth,
    $tileHeight
  )

  $canvas = [System.Drawing.Bitmap]::new(512, 512)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $destination = [System.Drawing.Rectangle]::new(28, 28, 456, 456)
  $graphics.DrawImage($sheet, $destination, $crop, [System.Drawing.GraphicsUnit]::Pixel)

  $outputPath = Join-Path $outDir "$($character.Name).png"
  $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $graphics.Dispose()
  $canvas.Dispose()
}

$sheet.Dispose()

Get-ChildItem $outDir -Filter *.png | Select-Object FullName, Length
