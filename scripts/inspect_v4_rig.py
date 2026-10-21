"""Diagnóstico offline de GLB V4: nodos, huesos y clips para calibrar pilotos.
No modifica ni descomprime archivos dentro del repositorio.
"""
import gzip
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODELS = ["01_mateo", "02_ernesto", "pulsar", "taypan", "mototaxi-roja", "canonera-abierta"]
KEYS = ("hip", "pelvis", "spine", "shoulder", "arm", "hand", "wrist", "leg", "thigh",
        "calf", "shin", "knee", "foot", "ankle", "seat", "asiento", "silla",
        "tank", "tanque", "handle", "manub", "saddle", "chasis", "steer", "head", "rig")

def inspect(name):
    raw = gzip.decompress((ROOT/"game/assets-v4"/(name+".glb.gz")).read_bytes())
    if raw[:4] != b"glTF":
        raise ValueError(name)
    count = int.from_bytes(raw[12:16], "little")
    info = json.loads(raw[20:20+count])
    nodes = info.get("nodes", [])
    print("=== MODEL", name, "nodes", len(nodes),
          "skins", len(info.get("skins", [])),
          "animations", len(info.get("animations", [])), "===")
    print("NAMES", json.dumps([n.get("name") for n in nodes[:38]],ensure_ascii=False))
    print("SKINS",json.dumps([
        {"joints": len(s.get("joints",[])),
         "names": [nodes[i].get("name") for i in s.get("joints",[])[:95]]}
         for s in info.get("skins",[])],ensure_ascii=False))
    print("CHANNELS",json.dumps([
        {"name":a.get("name"),"channels":len(a.get("channels",[])),
         "sample": [{"name":nodes[c.get("target",{}).get("node",0)].get("name"),
           "path":c.get("target",{}).get("path")}
           for c in a.get("channels",[])[:6]]}
        for a in info.get("animations",[])[:8]],ensure_ascii=False))
    for i,n in enumerate(nodes):
        nm = n.get("name","")
        if any(k in nm.lower() for k in KEYS):
            print("NODE",i,json.dumps({"name":nm, "t":n.get("translation"),
                "r":n.get("rotation"),"s":n.get("scale"),
                "mesh":n.get("mesh"),"children":n.get("children",[])[:6],
                "camera":n.get("camera")},ensure_ascii=False))
    print("ROOTS",json.dumps([{"name":nodes[i].get("name"),
        "t":nodes[i].get("translation"),"r":nodes[i].get("rotation")}
        for sc in info.get("scenes",[]) for i in sc.get("nodes",[])],ensure_ascii=False))
    print("ENDMODEL",name)

if __name__ == "__main__":
    for name in MODELS:
        inspect(name)
