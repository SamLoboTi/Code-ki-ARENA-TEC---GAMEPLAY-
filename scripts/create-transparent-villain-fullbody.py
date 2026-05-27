from pathlib import Path
from io import BytesIO

from PIL import Image, ImageFilter
from rembg import remove

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "characters" / "villain-fullbody-lineup.png"
OUT = ROOT / "public" / "characters" / "villains"
OUT.mkdir(parents=True, exist_ok=True)

VILLAINS = [
    ("freeza", (0, 52, 350, 918)),
    ("cell", (325, 26, 698, 918)),
    ("majin-buu", (620, 72, 1015, 918)),
    ("beerus", (960, 46, 1325, 918)),
    ("jiren", (1265, 48, 1692, 918)),
]

CANVAS = (620, 860)
MAX_BODY = (560, 820)


def alpha_bbox(image: Image.Image):
    return image.getchannel("A").getbbox()


def remove_background(crop: Image.Image):
    buffer = BytesIO()
    crop.save(buffer, format="PNG")
    result = remove(buffer.getvalue())
    return Image.open(BytesIO(result)).convert("RGBA")


def normalize(image: Image.Image):
    bbox = alpha_bbox(image)
    if not bbox:
        return image
    subject = image.crop(bbox)
    subject.thumbnail(MAX_BODY, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - subject.width) // 2
    y = CANVAS[1] - subject.height - 12
    canvas.alpha_composite(subject, (x, y))
    return canvas


def soften(image: Image.Image):
    r, g, b, a = image.split()
    a = a.filter(ImageFilter.GaussianBlur(0.25))
    return Image.merge("RGBA", (r, g, b, a))


def main():
    source = Image.open(SOURCE).convert("RGBA")
    for name, box in VILLAINS:
        crop = source.crop(box)
        transparent = remove_background(crop)
        transparent = soften(transparent)
        normalized = normalize(transparent)
        output = OUT / f"{name}-villain-fullbody.png"
        normalized.save(output)
        print(output)


if __name__ == "__main__":
    main()
