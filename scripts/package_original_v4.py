"""Ensamblar el JUEGO ORIGINAL con exactamente 10 personas y 6 vehículos GLB.

Conserva los recursos, luces, calles y texturas urbanas sin modificar.
Elimina del HTML publicado los modelos antiguos, LOD y animaciones obsoletas.
No acepta modelos ficticios ni omite archivos silenciosamente.
"""
from __future__ import annotations
import argparse
import base64
import gzip
import hashlib
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/"game/assets-v4"
CAST=("01_mateo","02_ernesto","03_daniel","04_luis","05_rafael",
      "06_valeria","07_marisol","08_xiomara","09_rosa","10_elena")
FLEET=("hilux","landcruiser","pulsar","taypan","mototaxi-roja","canonera-abierta")
IDS=CAST+FLEET
OLD_TAGS={"asset-humans","asset-animation38","asset-actor-motion","pack48-humans"}
# El bootstrap heredado captura y elimina los asset-* al inicio. Como V4
# sustituye el paquete humano antiguo, no debe pedir asset-humans ausente.
BOOTSTRAP_OLD=b'for(const name of ["world", "extensions", "vehicles", "data", "babylon", "loaders", "humans", "surfaces"])'
BOOTSTRAP_V4=b'for(const name of ["world", "extensions", "vehicles", "data", "babylon", "loaders", "surfaces"])'

def patch_bootstrap(raw: bytes) -> bytes:
    if raw.count(BOOTSTRAP_OLD)!=1:
        raise ValueError("No se encontró exactamente una carga antigua de humanos en el bootstrap: revisar base")
    return raw.replace(BOOTSTRAP_OLD,BOOTSTRAP_V4,1)

TAG=re.compile(rb'<script\b(?P<attrs>[^>]*\bid="(?P<id>[^"]+)"[^>]*)>(?P<body>.*?)</script>',re.I|re.S)
END=b"</body>"

def build(source:Path,output:Path)->dict:
    source=source.resolve();output=output.resolve()
    if source==output: raise ValueError("Usá dos rutas distintas: no sobrescribir el original")
    if not source.is_file():raise FileNotFoundError(source)
    specs=json.loads((ASSETS/"specifications.json").read_text(encoding="utf8"))
    records=specs.get("characters",[])+specs.get("vehicles",[])
    if len(records)!=16 or tuple(x["id"] for x in records)!=IDS:
        raise ValueError("Se requieren exactamente Mateo, 9 NPC y los 6 vehículos V4")
    new={}
    for model in records:
        key=model["id"];packed=(ASSETS/(key+".glb.gz")).read_bytes()
        glb=gzip.decompress(packed)
        if len(glb)!=model["bytes"] or glb[:4]!=b"glTF" or hashlib.sha256(glb).hexdigest()!=model["sha256"]:
            raise ValueError("GLB dañado o sustituido: "+key)
        new[key]=b'<script type="application/octet-stream" id="v4-original-'+key.encode()+b'">'+base64.b64encode(packed)+b'</script>'
    raw=source.read_bytes()
    if raw.count(b'id="v4-original-specifications"'):
        raise ValueError("Los modelos V4 ya están insertados; no duplicarlos")
    replaced=[];old_vehicles=[]
    def scrub(match):
        key=match.group("id").decode("ascii")
        if key=="asset-vehicles":
            old=json.loads(gzip.decompress(base64.b64decode(match.group("body"))))
            old_vehicles.extend(old.get("models",{}))
            # Only 18 shared material definitions remain for city details.
            palette={"models":{},"lod":{},"variants":{},"materials":old["materials"],"equipment":{}}
            compressed=gzip.compress(json.dumps(palette,separators=(",",":")).encode(),mtime=0)
            replaced.append(key)
            return match.group(0)[:match.start("body")-match.start()]+base64.b64encode(compressed)+b"</script>"
        if key in OLD_TAGS or key.startswith("resource48-humans-"):
            replaced.append(key);return b""
        return match.group(0)
    cleaned=patch_bootstrap(TAG.sub(scrub,raw))
    if len(old_vehicles)<10 or len(replaced)<12:
        raise ValueError("No se encontró la flota y el elenco antiguos: no cambiar el mapa")
    if cleaned.count(END)!=1: raise ValueError("Falta un cierre </body> único")
    metadata=b'<script type="application/json" id="v4-original-specifications">'+json.dumps(specs,separators=(",",":"),ensure_ascii=False).encode()+b'</script>'
    scripts=b"\n".join((metadata,)+(tuple(new[k] for k in IDS)))
    cleaned=cleaned.replace(END,scripts+b"\n"+END,1)
    remaining={x.group("id").decode("ascii") for x in TAG.finditer(cleaned)}
    if OLD_TAGS&remaining or any(x.startswith("resource48-humans-") for x in remaining):
        raise AssertionError("Se encontraron modelos humanos eliminados")
    if not all(("v4-original-"+x) in remaining for x in IDS):
        raise AssertionError("Falta un modelo nuevo")
    if b'const originalV4=' not in cleaned or b'await originalV4.prepare' not in cleaned:
        raise ValueError("No se activó el motor nuevo; bloqueado antes de publicar")
    output.parent.mkdir(parents=True,exist_ok=True)
    temporary=output.with_suffix(".v4.tmp")
    try:
        temporary.write_bytes(cleaned)
        temporary.replace(output)
    finally:
        temporary.unlink(missing_ok=True)
    report={"oldVehicleModelsRemoved":len(old_vehicles),"oldModelTagsRemoved":len(replaced),
            "newCharacters":len(CAST),"newVehicleTypes":len(FLEET),"bytes":len(cleaned),
            "sha256":hashlib.sha256(cleaned).hexdigest(),"graphics":"original (world blocks unchanged)"}
    (output.parent/"v4-integrity.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    return report

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--source",required=True,type=Path)
    parser.add_argument("--output",required=True,type=Path)
    args=parser.parse_args()
    print(json.dumps(build(args.source,args.output),ensure_ascii=False))
