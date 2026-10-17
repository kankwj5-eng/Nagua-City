#!/usr/bin/env python3
"""Prepara exactamente diez GLB de Nicaragua v4, sin modificar el motor."""
from __future__ import annotations

import argparse
import hashlib
import json
import struct
import zipfile
from pathlib import Path

NAMES = ("mateo", "ernesto", "daniel", "luis", "rafael",
         "valeria", "marisol", "xiomara", "rosa", "elena")
IDS = tuple(f"{i:02}_{name}" for i, name in enumerate(NAMES, 1))
REQUIRED_CLIPS = {"Idle", "Walk", "Run", "Punch_L", "Punch_R", "HitReaction"}


def inspect_glb(data: bytes, identifier: str) -> dict:
    if len(data) < 20 or data[:4] != b"glTF":
        raise ValueError(f"GLB inválido: {identifier}")
    version, total, size, chunk_type = struct.unpack_from("<4I", data, 4)
    if version != 2 or total != len(data) or chunk_type != 0x4E4F534A:
        raise ValueError(f"Encabezado GLB inválido: {identifier}")
    obj = json.loads(data[20:20 + size])
    expected_bones = 79 if identifier == "01_mateo" else 52
    if not obj.get("skins") or len(obj["skins"][0].get("joints", [])) != expected_bones:
        raise ValueError(f"Esqueleto inesperado: {identifier}")
    animations = [a.get("name") for a in obj.get("animations", [])]
    if len(animations) != (37 if identifier == "01_mateo" else 12):
        raise ValueError(f"Cantidad inesperada de animaciones: {identifier}")
    if len(animations) != len(set(animations)) or not REQUIRED_CLIPS.issubset(animations):
        raise ValueError(f"Faltan acciones necesarias: {identifier}")
    if "KHR_mesh_quantization" not in obj.get("extensionsRequired", []):
        raise ValueError(f"Falta extensión glTF requerida: {identifier}")
    return {
        "id": identifier, "nombre": identifier.split("_", 1)[1].capitalize(),
        "protagonista": identifier == "01_mateo",
        "archivo": identifier + ".glb", "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "huesos": expected_bones, "animaciones": animations
    }


def stage(source: Path, target: Path) -> dict:
    if not source.is_file():
        raise FileNotFoundError(source)
    selected = []
    with zipfile.ZipFile(source) as archive:
        paths = set(archive.namelist())
        for identifier in IDS:
            candidates = (
                f"Personajes-Nicaragua-v4/models/{identifier}/{identifier}.glb",
                f"personajes/{identifier}.glb"
            )
            found = [path for path in candidates if path in paths]
            if len(found) != 1:
                raise ValueError(f"Falta o está duplicado el modelo principal: {identifier}")
            data = archive.read(found[0])
            selected.append((inspect_glb(data, identifier), data))
    # Validate all models and destination before writing a single file.
    for info, data in selected:
        dest = target / info["archivo"]
        if dest.exists() and hashlib.sha256(dest.read_bytes()).hexdigest() != info["sha256"]:
            raise FileExistsError(f"No se reemplaza un modelo distinto: {dest}")
    target.mkdir(parents=True, exist_ok=True)
    for info, data in selected:
        dest = target / info["archivo"]
        if not dest.exists():
            dest.write_bytes(data)
    report = {
        "version": 4, "totalModelos": 10, "protagonista": "Mateo",
        "npc": 9, "modelosLOD1Importados": 0,
        "runtimeHabilitado": False, "personajes": [info for info, _ in selected]
    }
    (target / "cast.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("zip", type=Path, help="Paquete original o archivo reducido a diez GLB")
    parser.add_argument("--output", type=Path,
                        default=Path(__file__).resolve().parents[1] / "game/assets/characters-v4")
    args = parser.parse_args()
    result = stage(args.zip, args.output)
    print(json.dumps({
        "modelos": result["totalModelos"], "lod1": result["modelosLOD1Importados"],
        "destino": str(args.output), "runtimeHabilitado": False
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
