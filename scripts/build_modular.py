"""Empaqueta el código fuente organizado sin alterar la semántica del juego.

El HTML original en Git LFS es el contenedor de recursos. Primero construimos
la versión optimizada de referencia y después reemplazamos únicamente el cuerpo
de appSource y los bloques CSS declarados. Las posiciones, nombres y el orden de
ejecución de las funciones se conservan.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import mmap
import re
from pathlib import Path

from build_performance import ROOT, build as build_legacy, copy_range, digest, locate


def sha(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def safe_file(value: str) -> Path:
    """Ninguna ruta del manifiesto puede escapar del repositorio."""
    candidate = (ROOT / value).resolve()
    if not candidate.is_relative_to(ROOT.resolve()):
        raise ValueError("Ruta fuera del repositorio en el manifiesto: " + value)
    if not candidate.is_file():
        raise FileNotFoundError("Módulo faltante: " + value)
    return candidate


def source_from_modules(manifest: dict) -> bytes:
    entries = manifest.get("segments") or []
    if manifest.get("schemaVersion") != 1 or len(entries) < 100:
        raise ValueError("Manifiesto modular ausente o incompleto")
    paths = [x["path"] for x in entries]
    if len(paths) != len(set(paths)):
        raise ValueError("Rutas duplicadas entre módulos")
    for name in paths:
        if not name.startswith("game/src/") or not name.endswith(".js"):
            raise ValueError("Ruta inválida de código fuente: " + name)
    source = b"".join(safe_file(name).read_bytes() for name in paths)
    if b"</script>" in source.lower():
        raise ValueError("El script contiene un cierre HTML que rompería el bloque")
    return source


def collect_style_ranges(document: mmap.mmap) -> list[tuple[int, int, str]]:
    pattern = re.compile(rb"<style\b[^>]*>", re.I)
    output = []
    for m in pattern.finditer(document):
        close = document.find(b"</style>", m.end())
        if close < 0:
            raise ValueError("Bloque CSS sin cierre en el HTML")
        output.append((m.end(), close, m.group().decode("utf8")))
    return output


def inject(baseline: Path, output: Path, verify_pristine: bool = False) -> dict:
    manifest_path = ROOT / "game/manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf8"))
    app_start, app_end, original_app = locate(baseline)
    before = original_app.encode("utf8")
    if sha(before) != manifest["baselineAppSha256"]:
        raise ValueError(
            "La construcción de referencia cambió; sincronizar módulos antes de compilar. "
            "No se sobreescribirán cambios del motor sin revisión."
        )
    app = source_from_modules(manifest)
    if verify_pristine and app != before:
        raise ValueError("Los módulos de la migración no reconstruyen byte a byte el código original")

    replacements = [(app_start, app_end, app, "appSource")]
    with baseline.open("rb") as source, mmap.mmap(source.fileno(), 0, access=mmap.ACCESS_READ) as data:
        styles = collect_style_ranges(data)
        expected = manifest.get("inlineStyles", [])
        if len(styles) != len(expected):
            raise ValueError("Cambió el número de estilos HTML")
        for (start, end, tag), entry in zip(styles, expected):
            if entry["openTag"] != tag or sha(data[start:end]) != entry["sha256"]:
                raise ValueError("La hoja CSS original cambió: " + entry["path"])
            if not entry["path"].startswith("game/styles/") or not entry["path"].endswith(".css"):
                raise ValueError("Ruta CSS inválida")
            replacement = safe_file(entry["path"]).read_bytes()
            if b"</style>" in replacement.lower():
                raise ValueError("CSS contiene cierre de HTML inválido: " + entry["path"])
            if verify_pristine and replacement != data[start:end]:
                raise ValueError("El CSS no coincide byte a byte con la migración")
            replacements.append((start, end, replacement, entry["path"]))

        replacements.sort(key=lambda item: item[0])
        prev_end = 0
        for start, end, _, label in replacements:
            if start < prev_end or end < start:
                raise ValueError("Solapamiento o longitud incorrecta en " + label)
            prev_end = end

        output.parent.mkdir(parents=True, exist_ok=True)
        temporary = output.with_suffix(".modular.tmp")
        try:
            with temporary.open("wb") as target:
                position = 0
                for start, end, replacement, _ in replacements:
                    copy_range(source, target, position, start)
                    target.write(replacement)
                    position = end
                copy_range(source, target, position, len(data))
            temporary.replace(output)
        finally:
            temporary.unlink(missing_ok=True)

    identical = digest(baseline) == digest(output)
    if verify_pristine and not identical:
        raise ValueError("La build modular no reproduce exactamente el HTML original")
    result = {
        "manifest": "game/manifest.json",
        "modules": len(manifest["segments"]),
        "inlineStyles": len(manifest.get("inlineStyles", [])),
        "sourceBaselineSha256": manifest["baselineAppSha256"],
        "sourceCurrentSha256": sha(app),
        "baselineGameSha256": digest(baseline),
        "modularGameSha256": digest(output),
        "byteIdentical": identical,
        "output": str(output.relative_to(ROOT)),
        "bytes": output.stat().st_size,
    }
    (output.parent / "module-verification.json").write_text(
        json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf8"
    )
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=ROOT / "Managua_Del_taller_al_lago(1).html")
    parser.add_argument("--output", type=Path, default=ROOT / "dist/Managua.html")
    parser.add_argument("--verify-pristine", action="store_true",
                        help="Exige que el código, el CSS y los bytes de salida sean idénticos")
    args = parser.parse_args()
    source = args.source.resolve()
    output = args.output.resolve()
    baseline = ROOT / "dist/.modular-base/Managua.html"
    if output == baseline or source == baseline:
        raise ValueError("No sobrescribir ni usar la construcción temporal como fuente")
    build_legacy(source, baseline)
    result = inject(baseline, output, verify_pristine=args.verify_pristine)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
