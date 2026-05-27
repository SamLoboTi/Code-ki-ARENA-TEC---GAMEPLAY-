from pathlib import Path
from io import BytesIO

from PIL import Image, ImageFilter

try:
    from rembg import remove
except Exception as exc:
    raise SystemExit(f"rembg import failed: {exc}")


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "characters" / "anime-warriors-lineup.png"
OUT = ROOT / "public" / "characters" / "fullbody"
OUT.mkdir(parents=True, exist_ok=True)

CHARACTERS = [
    ("goku", (0, 55, 430, 918)),
    ("vegeta", (360, 38, 720, 918)),
    ("gohan", (660, 58, 1038, 918)),
    ("piccolo", (935, 35, 1348, 918)),
    ("trunks", (1270, 55, 1688, 918)),
    ("freeza-boss", (0, 40, 344, 472)),
    ("cell-boss", (0, 513, 344, 930)),
    ("majin-buu-boss", (1550, 474, 1692, 918)),
    ("beerus-boss", (1550, 118, 1692, 352)),
    ("villain-hard-boss", (1190, 230, 1510, 650)),
]

CANVAS = (620, 860)
MAX_BODY = (540, 810)


def alpha_bbox(image: Image.Image):
    alpha = image.getchannel("A")
    return alpha.getbbox()


def soften_alpha(image: Image.Image):
    r, g, b, a = image.split()
    a = a.filter(ImageFilter.GaussianBlur(0.35))
    return Image.merge("RGBA", (r, g, b, a))


def normalize_subject(image: Image.Image):
    bbox = alpha_bbox(image)
    if not bbox:
        return image

    subject = image.crop(bbox)
    subject.thumbnail(MAX_BODY, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - subject.width) // 2
    y = CANVAS[1] - subject.height - 14
    canvas.alpha_composite(subject, (x, y))
    return canvas


def remove_background(crop: Image.Image):
    buffer = BytesIO()
    crop.save(buffer, format="PNG")
    result = remove(buffer.getvalue())
    return Image.open(BytesIO(result)).convert("RGBA")


def main():
    source = Image.open(SOURCE).convert("RGBA")
    for name, box in CHARACTERS:
        crop = source.crop(box)
        transparent = remove_background(crop)
        transparent = soften_alpha(transparent)
        normalized = normalize_subject(transparent)
        output = OUT / f"{name}-fullbody.png"
        normalized.save(output)
        print(output)


if __name__ == "__main__":
    main()
