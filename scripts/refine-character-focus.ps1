Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

$Root = Resolve-Path (Join-Path $PSScriptRoot '..')

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

function Ensure-Directory {
  param([string]$Path)

  $directory = Split-Path $Path -Parent
  if (!(Test-Path $directory)) {
    New-Item -ItemType Directory -Path $directory | Out-Null
  }
}

function Save-FittedImage {
  param(
    [System.Drawing.Bitmap]$SourceBitmap,
    [System.Drawing.Rectangle]$SourceRect,
    [string]$Destination,
    [int]$CanvasWidth,
    [int]$CanvasHeight,
    [int]$PaddingX,
    [int]$PaddingY
  )

  $destinationPath = Join-Path $Root $Destination
  Ensure-Directory $destinationPath

  $targetWidth = $CanvasWidth - ($PaddingX * 2)
  $targetHeight = $CanvasHeight - ($PaddingY * 2)
  $scale = [Math]::Min($targetWidth / $SourceRect.Width, $targetHeight / $SourceRect.Height)
  $drawWidth = [int][Math]::Round($SourceRect.Width * $scale)
  $drawHeight = [int][Math]::Round($SourceRect.Height * $scale)
  $drawX = [int][Math]::Round(($CanvasWidth - $drawWidth) / 2)
  $drawY = [int][Math]::Round(($CanvasHeight - $drawHeight) / 2)

  $canvas = [System.Drawing.Bitmap]::new($CanvasWidth, $CanvasHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.DrawImage($SourceBitmap, [System.Drawing.Rectangle]::new($drawX, $drawY, $drawWidth, $drawHeight), $SourceRect, [System.Drawing.GraphicsUnit]::Pixel)
    } finally {
      $graphics.Dispose()
    }

    $canvas.Save($destinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $canvas.Dispose()
  }
}

function Recolor-VegetaHair {
  $sourcePath = Join-Path $Root 'public\characters\fullbody\vegeta-arena-v4.png'
  $destinationPath = Join-Path $Root 'public\characters\fullbody\vegeta-arena-v5.png'
  Ensure-Directory $destinationPath

  $bitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)
  try {
    for ($y = 0; $y -lt $bitmap.Height; $y += 1) {
      for ($x = 0; $x -lt $bitmap.Width; $x += 1) {
        $pixel = $bitmap.GetPixel($x, $y)
        if ($pixel.A -lt 8) { continue }

        $isCyanHair = $pixel.R -lt 110 -and $pixel.G -gt 105 -and $pixel.B -gt 130 -and ($pixel.B - $pixel.R) -gt 55
        if ($isCyanHair) {
          $newR = [Math]::Min(255, [int]($pixel.R * 0.32 + 8))
          $newG = [Math]::Min(255, [int]($pixel.G * 0.48 + 18))
          $newB = [Math]::Min(255, [int]($pixel.B * 0.74 + 18))
          $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, $newR, $newG, $newB))
        }
      }
    }

    $bitmap.Save($destinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $bitmap.Dispose()
  }
}

function New-FocusAssets {
  param(
    [string]$Source,
    [string]$PortraitDestination,
    [string]$CombatDestination,
    [double]$CropHeightRatio = 0.56,
    [double]$CropWidthRatio = 1.0,
    [double]$TopShiftRatio = 0.0
  )

  $sourcePath = Join-Path $Root $Source
  $bitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)
  try {
    $bounds = Find-AlphaBounds $bitmap
    $cropHeight = [int][Math]::Round($bounds.Height * $CropHeightRatio)
    $cropWidth = [int][Math]::Round($bounds.Width * $CropWidthRatio)
    $cropX = [int][Math]::Round($bounds.X + (($bounds.Width - $cropWidth) / 2))
    $cropY = [int][Math]::Round($bounds.Y + ($bounds.Height * $TopShiftRatio))

    if ($cropX -lt 0) { $cropX = 0 }
    if ($cropY -lt 0) { $cropY = 0 }
    if ($cropX + $cropWidth -gt $bitmap.Width) { $cropWidth = $bitmap.Width - $cropX }
    if ($cropY + $cropHeight -gt $bitmap.Height) { $cropHeight = $bitmap.Height - $cropY }

    $focusRect = [System.Drawing.Rectangle]::new($cropX, $cropY, $cropWidth, $cropHeight)
    Save-FittedImage -SourceBitmap $bitmap -SourceRect $focusRect -Destination $PortraitDestination -CanvasWidth 768 -CanvasHeight 768 -PaddingX 36 -PaddingY 28
    Save-FittedImage -SourceBitmap $bitmap -SourceRect $focusRect -Destination $CombatDestination -CanvasWidth 1024 -CanvasHeight 1536 -PaddingX 64 -PaddingY 90
  } finally {
    $bitmap.Dispose()
  }
}

New-FocusAssets -Source 'public\characters\fullbody\vegeta-arena-v4.png' -PortraitDestination 'public\characters\portraits\vegeta-portrait-v4.png' -CombatDestination 'public\characters\focus\vegeta-combat-v4.png' -CropHeightRatio 0.58 -CropWidthRatio 0.92
Recolor-VegetaHair
New-FocusAssets -Source 'public\characters\fullbody\vegeta-arena-v5.png' -PortraitDestination 'public\characters\portraits\vegeta-portrait-v5.png' -CombatDestination 'public\characters\focus\vegeta-combat-v5.png' -CropHeightRatio 0.58 -CropWidthRatio 0.92
New-FocusAssets -Source 'public\characters\fullbody\videl-arena-v3.png' -PortraitDestination 'public\characters\portraits\videl-portrait-v4.png' -CombatDestination 'public\characters\focus\videl-combat-v4.png' -CropHeightRatio 0.55 -CropWidthRatio 0.86 -TopShiftRatio 0.0
New-FocusAssets -Source 'public\characters\fullbody\bulma-arena-v3.png' -PortraitDestination 'public\characters\portraits\bulma-portrait-v4.png' -CombatDestination 'public\characters\focus\bulma-combat-v4.png' -CropHeightRatio 0.58 -CropWidthRatio 0.82 -TopShiftRatio 0.0
New-FocusAssets -Source 'tmp\source-android18-face.png' -PortraitDestination 'public\characters\portraits\android18-portrait-v4.png' -CombatDestination 'public\characters\focus\android18-combat-v4.png' -CropHeightRatio 0.98 -CropWidthRatio 0.98 -TopShiftRatio 0.0

Copy-Item (Join-Path $Root 'public\characters\fullbody\vegeta-arena-v5.png') (Join-Path $Root 'public\characters\vegeta-arena-v5.png') -Force

@(
  'public\characters\fullbody\vegeta-arena-v5.png',
  'public\characters\portraits\vegeta-portrait-v5.png',
  'public\characters\portraits\videl-portrait-v4.png',
  'public\characters\portraits\bulma-portrait-v4.png',
  'public\characters\portraits\android18-portrait-v4.png',
  'public\characters\focus\videl-combat-v4.png',
  'public\characters\focus\bulma-combat-v4.png',
  'public\characters\focus\android18-combat-v4.png'
) | ForEach-Object {
  $path = Join-Path $Root $_
  $image = [System.Drawing.Bitmap]::FromFile($path)
  try {
    [PSCustomObject]@{ Asset = $_; Size = "$($image.Width)x$($image.Height)" }
  } finally {
    $image.Dispose()
  }
} | Format-Table -AutoSize
