#!/usr/bin/env python3
"""Quita los medios del elenco y flota viejos en una copia NO JUGABLE.

No modifica el HTML original, el código modular ni la web publicada.
Hace falta inyectar nuevos recursos y adaptar el runtime ANTES de usar esta salida.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
from pathlib import Path

LEGACY_EXACT=frozenset({
    "asset-humans","asset-animation38","asset-actor-motion",
    "asset-vehicles","pack48-humans","pack48-vehicles"
})
LEGACY_PREFIX=("resource48-humans-","resource48-vehicles-")
SCRIPT=re.compile(rb'<script\b(?P<attrs>[^>]*?)>(?P<body>.*?)</script\s*>',re.I|re.S)
IDENTIFIER=re.compile(rb'(?<![\w-])id\s*=\s*(["\x27])([^"\x27]+)\1',re.I)

def is_legacy(identifier:str)->bool:
    return identifier in LEGACY_EXACT or identifier.startswith(LEGACY_PREFIX)

def clean_bytes(source:bytes,*,strict:bool=True):
    removed=[];kept=[]
    def transform(match):
        m=IDENTIFIER.search(match.group("attrs"))
        identifier=m.group(2).decode("ascii","strict") if m else ""
        if is_legacy(identifier):
            removed.append({"id":identifier,"bytes":len(match.group(0))})
            return b""
        if identifier.startswith(("asset-","pack48-","resource48-")):
            kept.append(identifier)
        return match.group(0)
    clean=SCRIPT.sub(transform,source)
    if strict:
        ids={x["id"] for x in removed}
        if not {"asset-humans","pack48-humans"}.intersection(ids):
            raise ValueError("Falta catálogo humano: no se puede verificar limpieza")
        if "asset-vehicles" not in ids:
            raise ValueError("Falta catálogo vehicular: no se puede verificar limpieza")
    for m in SCRIPT.finditer(clean):
        tag=IDENTIFIER.search(m.group("attrs"))
        if tag and is_legacy(tag.group(2).decode("ascii","strict")):
            raise ValueError("Persisten recursos antiguos")
    report={
        "target":"staging-only-not-playable",
        "sourceSha256":hashlib.sha256(source).hexdigest(),
        "cleanSha256":hashlib.sha256(clean).hexdigest(),
        "originalBytes":len(source),"cleanBytes":len(clean),
        "removedBytes":len(source)-len(clean),
        "removed":removed,"preservedMediaIds":kept,
        "newModelsInjected":False,"originalRuntimeStillNeedsReplacement":True,
    }
    return clean,report

def clean_file(src:Path,dst:Path,*,strict:bool=True):
    if src.resolve()==dst.resolve():
        raise ValueError("Prohibido sobrescribir el juego original")
    if dst.exists():
        raise FileExistsError("Destino ocupado: "+str(dst))
    cleaned,report=clean_bytes(src.read_bytes(),strict=strict)
    dst.parent.mkdir(parents=True,exist_ok=True)
    dst.write_bytes(cleaned)
    (dst.parent/(dst.name+".clean-report.json")).write_text(
        json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    return report

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input",type=Path,required=True)
    parser.add_argument("--output",type=Path,required=True)
    parser.add_argument("--staging-only",action="store_true")
    args=parser.parse_args()
    if not args.staging_only:
        parser.error("Se requiere --staging-only: faltan motores y vehículos nuevos")
    result=clean_file(args.input,args.output)
    print(json.dumps({k:v for k,v in result.items() if k!="preservedMediaIds"},
        ensure_ascii=False))

if __name__=="__main__":main()
