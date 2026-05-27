Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

$Root = Resolve-Path (Join-Path $PSScriptRoot '..')
$CanvasWidth = 1024
$CanvasHeight = 1536
$PaddingX = 92
$PaddingTop = 70
$PaddingBottom = 72

function Find-AlphaBounds {
  param([System.Drawing.Bitmap]$Bitmap)

  $minX = $Bitmap.Width
  $minY = $Bitmap.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $Bitmap.Height; $y += 1) {
    for ($x = 0; $x -lt $Bitmap.Width; $x += 1) {
      if ($Bitmap.GetPixel($x, $y).A -gt 8) {
        if ($x -lt $minX) { $minX = $x }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt 0 -or $maxY -lt 0) {
    return [System.Drawing.Rectangle]::new(0, 0, $Bitmap.Width, $Bitmap.Height)
  }

  return [System.Drawing.Rectangle]::new($minX, $minY, $maxX - $minX + 1, $maxY - $minY + 1)
}

function Normalize-Asset {
  param(
    [string]$Source,
    [string]$Destination
  )

  $sourcePath = Join-Path $Root $Source
  $destinationPath = Join-Path $Root $Destination
  $destinationDir = Split-Path $destinationPath -Parent
  if (!(Test-Path $destinationDir)) {
    New-Item -ItemType Directory -Path $destinationDir | Out-Null
  }

  $sourceBitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)
  try {
    $bounds = Find-AlphaBounds $sourceBitmap
    $targetWidth = $CanvasWidth - ($PaddingX * 2)
    $targetHeight = $CanvasHeight - $PaddingTop - $PaddingBottom
    $scale = [Math]::Min($targetWidth / $bounds.Width, $targetHeight / $bounds.Height)
    $drawWidth = [int][Math]::Round($bounds.Width * $scale)
    $drawHeight = [int][Math]::Round($bounds.Height * $scale)
    $drawX = [int][Math]::Round(($CanvasWidth - $drawWidth) / 2)
    $drawY = [int][Math]::Round($CanvasHeight - $PaddingBottom - $drawHeight)

    $canvas = [System.Drawing.Bitmap]::new($CanvasWidth, $CanvasHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($canvas)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($sourceBitmap, [System.Drawing.Rectangle]::new($drawX, $drawY, $drawWidth, $drawHeight), $bounds, [System.Drawing.GraphicsUnit]::Pixel)
      } finally {
        $graphics.Dispose()
      }

      $canvas.Save($destinationPath, [System.Drawing.Imaging.ImageFormat]::Png)

      [PSCustomObject]@{
        Source = $Source
        Destination = $Destination
        Bounds = "$($bounds.Width)x$($bounds.Height)"
        Output = "$CanvasWidth`x$CanvasHeight"
        Draw = "$drawWidth`x$drawHeight"
      }
    } finally {
      $canvas.Dispose()
    }
  } finally {
    $sourceBitmap.Dispose()
  }
}

$assets = @(
  @{ Source = 'public\characters\fullbody\goku-fullbody-v2.png'; Destination = 'public\characters\fullbody\goku-arena-v3.png' },
  @{ Source = 'tmp\source-vegeta-new.png'; Destination = 'public\characters\fullbody\vegeta-arena-v4.png' },
  @{ Source = 'public\characters\fullbody\gohan-fullbody-v2.png'; Destination = 'public\characters\fullbody\gohan-arena-v3.png' },
  @{ Source = 'tmp\source-piccolo-v3.png'; Destination = 'public\characters\fullbody\piccolo-arena-v3.png' },
  @{ Source = 'public\characters\fullbody\trunks-fullbody.png'; Destination = 'public\characters\fullbody\trunks-arena-v3.png' },
  @{ Source = 'tmp\source-videl-new.png'; Destination = 'public\characters\fullbody\videl-arena-v3.png' },
  @{ Source = 'tmp\source-bulma-new.png'; Destination = 'public\characters\fullbody\bulma-arena-v3.png' },
  @{ Source = 'tmp\source-android18-new.png'; Destination = 'public\characters\fullbody\android18-arena-v3.png' },
  @{ Source = 'public\characters\villains\freeza-villain-fullbody.png'; Destination = 'public\characters\villains\freeza-arena-v3.png' },
  @{ Source = 'public\characters\villains\cell-villain-fullbody.png'; Destination = 'public\characters\villains\cell-arena-v3.png' },
  @{ Source = 'public\characters\villains\majin-buu-villain-fullbody.png'; Destination = 'public\characters\villains\majin-buu-arena-v3.png' },
  @{ Source = 'public\characters\villains\beerus-villain-fullbody.png'; Destination = 'public\characters\villains\beerus-arena-v3.png' }
)

$results = foreach ($asset in $assets) {
  Normalize-Asset -Source $asset.Source -Destination $asset.Destination
}

Copy-Item (Join-Path $Root 'public\characters\fullbody\goku-arena-v3.png') (Join-Path $Root 'public\characters\goku-arena-v3.png') -Force
Copy-Item (Join-Path $Root 'public\characters\fullbody\vegeta-arena-v4.png') (Join-Path $Root 'public\characters\vegeta-arena-v4.png') -Force
Copy-Item (Join-Path $Root 'public\characters\fullbody\gohan-arena-v3.png') (Join-Path $Root 'public\characters\gohan-arena-v3.png') -Force
Copy-Item (Join-Path $Root 'public\characters\fullbody\piccolo-arena-v3.png') (Join-Path $Root 'public\characters\piccolo-arena-v3.png') -Force
Copy-Item (Join-Path $Root 'public\characters\fullbody\trunks-arena-v3.png') (Join-Path $Root 'public\characters\trunks-arena-v3.png') -Force
Copy-Item (Join-Path $Root 'public\characters\fullbody\videl-arena-v3.png') (Join-Path $Root 'public\characters\videl-arena-v3.png') -Force
Copy-Item (Join-Path $Root 'public\characters\fullbody\bulma-arena-v3.png') (Join-Path $Root 'public\characters\bulma-arena-v3.png') -Force
Copy-Item (Join-Path $Root 'public\characters\fullbody\android18-arena-v3.png') (Join-Path $Root 'public\characters\android18-arena-v3.png') -Force

$results | Format-Table -AutoSize
