from pathlib import Path
from io import BytesIO
from PIL import Image, ImageFilter

try:
    from rembg import remove
except Exception:
    remove = None

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "R.png"
OUT = ROOT / "public" / "characters" / "bosses"
OUT.mkdir(parents=True, exist_ok=True)

COLUMNS = 13
ROWS = 8
CANVAS = (560, 560)
BOSSES = [
    ("freeza", 3, 6),
    ("cell", 0, 6),
    ("majin-buu", 12, 4),
    ("beerus", 12, 1),
    ("jiren", 10, 0),
    ("android", 11, 5),
    ("ginyu", 7, 5),
]


def make_radial_alpha(size):
    alpha = Image.new("L", size, 0)
    cx, cy = size[0] / 2, size[1] / 2
    max_d = min(size) * 0.48
    px = alpha.load()
    for y in range(size[1]):
        for x in range(size[0]):
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            value = int(max(0, min(255, (1 - d / max_d) * 255)))
            px[x, y] = value
    return alpha.filter(ImageFilter.GaussianBlur(8))


def main():
    sheet = Image.open(SOURCE).convert("RGBA")
    tile_w = sheet.width // COLUMNS
    tile_h = sheet.height // ROWS
    mask = make_radial_alpha(CANVAS)

    for name, grid_x, grid_y in BOSSES:
        crop = sheet.crop((grid_x * tile_w, grid_y * tile_h, (grid_x + 1) * tile_w, (grid_y + 1) * tile_h))
        crop = crop.resize((440, 440), Image.Resampling.LANCZOS)
        if remove:
            buffer = BytesIO()
            crop.save(buffer, format="PNG")
            crop = Image.open(BytesIO(remove(buffer.getvalue()))).convert("RGBA")
        canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        canvas.alpha_composite(crop, ((CANVAS[0] - crop.width) // 2, 74))
        r, g, b, a = canvas.split()
        combined_alpha = Image.composite(a, Image.new("L", CANVAS, 0), mask)
        final = Image.merge("RGBA", (r, g, b, combined_alpha))
        final.save(OUT / f"{name}-challenger.png")
        print(OUT / f"{name}-challenger.png")


if __name__ == "__main__":
    main()
