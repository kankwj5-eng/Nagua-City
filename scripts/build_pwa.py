"""Publica la PWA sin alterar el HTML original ni duplicar su carga inicial.

Uso:
  python3 scripts/build_performance.py --output dist/site/Managua.html
  python3 scripts/build_pwa.py --game dist/site/Managua.html --output dist/site

Requiere Pillow (solo durante la construcción) para generar PNG válidos.
"""
from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
ART = ROOT / "presentation/assets/managua-menu-reference.jpg"


def icon(size: int) -> Image.Image:
    # Dibujar a 512 y reducir después conserva contornos nítidos en Android.
    s = 512
    image = Image.new("RGB", (s, s))
    pixels = image.load()
    for y in range(s):
        for x in range(s):
            shade = min(1, ((x - 318) ** 2 + (y - 125) ** 2) ** 0.5 / 570)
            pixels[x, y] = (
                int(35 - 19 * shade), int(62 - 36 * shade), int(66 - 30 * shade)
            )
    drawing = ImageDraw.Draw(image)
    # Marco interior: margen generoso para un recorte maskable circular.
    drawing.rounded_rectangle((49, 49, 463, 463), 78, outline="#aa925c", width=5)
    drawing.rounded_rectangle((59, 59, 453, 453), 70, outline="#354e51", width=2)
    # Horizonte urbano nicaragüense, lago y reflejo.
    skyline = [(87, 339), (87, 290), (108, 290), (108, 260),
               (133, 260), (133, 303), (158, 303), (158, 276),
               (182, 276), (182, 319), (211, 319), (211, 282),
               (246, 282), (246, 308), (273, 308), (273, 255),
               (289, 255), (289, 285), (326, 285), (326, 268),
               (347, 268), (347, 304), (369, 304), (369, 285),
               (400, 285), (400, 339)]
    drawing.polygon(skyline + [(400, 355), (87, 355)], fill="#32575a")
    drawing.line((89, 360, 423, 360), fill="#c9ad76", width=5)
    for offset, opacity in [(26, "#547477"), (44, "#375f64"), (62, "#284a4f")]:
        drawing.arc((118, 344 + offset, 394, 394 + offset), 0, 180, fill=opacity, width=3)
    drawing.ellipse((358, 109, 389, 140), fill="#e6ce9b")
    # Inicial propia de la app (no modifica la imagen de menú aportada).
    try:
        fnt = ImageFont.truetype("DejaVuSans-Bold.ttf", 224)
        small = ImageFont.truetype("DejaVuSans-Bold.ttf", 31)
    except OSError:
        fnt = ImageFont.load_default()
        small = ImageFont.load_default()
    bounds = drawing.textbbox((0, 0), "N", font=fnt, stroke_width=0)
    width = bounds[2] - bounds[0]
    drawing.text(((512 - width) / 2 - bounds[0], 98 - bounds[1]), "N",
                 font=fnt, fill="#efd5a0", stroke_width=2, stroke_fill="#6e6549")
    label = "NAGUA CITY"
    bounds = drawing.textbbox((0, 0), label, font=small)
    drawing.text(((512 - (bounds[2] - bounds[0])) / 2, 392),
                 label, font=small, fill="#efe8d5")
    return image.resize((size, size), Image.Resampling.LANCZOS)


def build(game: Path, output: Path) -> dict:
    game = game.resolve()
    output = output.resolve()
    if not game.is_file():
        raise FileNotFoundError("No existe el juego compilado: " + str(game))
    with game.open("rb") as source:
        start = source.read(256)
    if start.startswith(b"version https://git-lfs.github.com/spec/v1"):
        raise ValueError("El juego es un puntero Git LFS: ejecuta git lfs pull.")
    if b"<" not in start:
        raise ValueError("El juego no parece ser HTML válido.")
    if not ART.is_file():
        raise FileNotFoundError("Falta el arte de menú original.")
    output.mkdir(parents=True, exist_ok=True)
    target = output / "Managua.html"
    if game != target:
        shutil.copyfile(game, target)
    for name in ["index.html", "style.css", "app.js", "sw.js",
                 "manifest.webmanifest", "offline.html"]:
        shutil.copyfile(WEB / name, output / name)
    assets = output / "assets"
    assets.mkdir(exist_ok=True)
    shutil.copyfile(ART, assets / "managua-menu-reference.jpg")
    icons = output / "icons"
    icons.mkdir(exist_ok=True)
    for size in [192, 512]:
        icon(size).save(icons / f"icon-{size}.png", optimize=True)
    (output / ".nojekyll").touch()
    manifest = json.loads((output / "manifest.webmanifest").read_text())
    for entry in manifest["icons"]:
        if not (output / entry["src"].removeprefix("./")).is_file():
            raise ValueError("Falta el icono declarado: " + entry["src"])
    report = {
        "app": manifest["short_name"],
        "game": target.name,
        "gameBytes": target.stat().st_size,
        "shellFiles": 10,
        "startURL": manifest["start_url"],
        "offlineGame": False,
        "offlineShell": True,
    }
    print(json.dumps(report, ensure_ascii=False))
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--game", type=Path, default=ROOT / "dist/Managua.html")
    parser.add_argument("--output", type=Path, default=ROOT / "dist/site")
    args = parser.parse_args()
    build(args.game, args.output)
