#!/usr/bin/env python3
"""Detecta dependencias del antiguo elenco antes del corte irreversible.

Por defecto imprime los hallazgos y no modifica archivos.
Con --strict falla si encuentra referencias antiguas; solo se habilitará
esta condición obligatoria después del cambio completo de assets/runtime.
"""
from __future__ import annotations
import argparse
import json
import re
from pathlib import Path

LEGACY = {
 "mallas_personaje_antiguo": re.compile(r"Citizen(?:Near|LOD|Atlas)|MPFB|Piel anatómica MH43", re.I),
 "contenedores_anteriores": re.compile(r"\bhumanContainers\b|\blowPeople\b", re.I),
 "animaciones_obsoletas": re.compile(r"asset-animation38|asset-actor-motion|pack48\(['\"]humans['\"]\)", re.I),
 "ropa_anteriores": re.compile(r"\bwardrobe\[type\]|\bdressHuman\(|\bprepareWardrobe25\(", re.I),
 "instanciacion_obsoleta": re.compile(r"\binstantiateHuman45\(|\bdistantPerson\(", re.I),
}
SOURCE_DIRS=("game/src",)
EXTRA=("scripts/build_startup.py","scripts/build_fast_web.py")


def audit(root: Path):
 files=[]
 for folder in SOURCE_DIRS:
  f=root/folder
  if f.is_dir(): files.extend(f.rglob("*.js"))
 files.extend(root/p for p in EXTRA if (root/p).is_file())
 results=[]
 for path in sorted(set(files)):
  try: text=path.read_text(encoding="utf-8")
  except UnicodeDecodeError: continue
  for lineno,line in enumerate(text.splitlines(),1):
   for category,pattern in LEGACY.items():
    if pattern.search(line):
     results.append({
      "ruta":str(path.relative_to(root)),"linea":lineno,
      "categoria":category
     })
 return results


def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument("--repo",type=Path,default=Path(__file__).resolve().parents[1])
 parser.add_argument("--strict",action="store_true",help="Falla si quedan referencias antiguas")
 args=parser.parse_args()
 found=audit(args.repo)
 print(json.dumps({
  "elencoV4Listo":not bool(found),
  "referenciasAnteriores":len(found),
  "archivos":len(set(p["ruta"] for p in found)),
  "detalles":found
 },ensure_ascii=False,indent=2))
 raise SystemExit(2 if found and args.strict else 0)


if __name__=="__main__":
 main()
