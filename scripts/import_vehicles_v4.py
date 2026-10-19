#!/usr/bin/env python3
"""Selecciona solamente los cuatro GLB finales, sin recursos de la flota vieja."""
from __future__ import annotations
import argparse,hashlib,json,struct,zipfile
from pathlib import Path

VEHICLES={
 "hilux":("Hilux-grafito.glb",("Delantera_Der","Delantera_Izq","Trasera_Der","Trasera_Izq"),("Direccion_Delantera_Der","Direccion_Delantera_Izq"),.413),
 "landcruiser":("Land-Cruiser-roja.glb",("Delantera_Der","Delantera_Izq","Trasera_Der","Trasera_Izq"),("Direccion_Delantera_Der","Direccion_Delantera_Izq"),.426),
 "pulsar":("Pulsar-NS200.glb",("Rueda_Delantera","Rueda_Trasera"),("Direccion",),.300),
 "taypan":("Serpento-Taypan-150.glb",("Rueda_Delantera","Rueda_Trasera"),("Direccion",),.296)
}

def verify(data,key):
 fn,wheels,steering,radius=VEHICLES[key]
 if len(data)<20 or data[:4]!=b"glTF":raise ValueError("No es GLB: "+fn)
 version,size,n,typ=struct.unpack_from("<4I",data,4)
 if version!=2 or size!=len(data) or typ!=0x4e4f534a or n>len(data)-20:raise ValueError("GLB corrupto: "+fn)
 raw=json.loads(data[20:20+n]);nodes=[x.get("name","") for x in raw.get("nodes",[])]
 clips=raw.get("animations",[]);names=[x.get("name","") for x in clips]
 needed={"Direccion_Izquierda","Direccion_Derecha"}|{"Rodar_"+n for n in wheels}
 if len(names)!=len(set(names)) or not needed.issubset(names):raise ValueError("Animaciones inválidas: "+fn)
 if any(nodes.count(n)!=1 for n in (*wheels,*steering)):raise ValueError("Pivotes de dirección o ruedas incompletos: "+fn)
 for a in clips:
  channels=[(nodes[c["target"]["node"]],c["target"]["path"]) for c in a["channels"]]
  if a["name"].startswith("Direccion_") and set(channels)!={(n,"rotation") for n in steering}:
   raise ValueError("La dirección no mueve los pivotes requeridos: "+fn)
  if a["name"].startswith("Rodar_") and channels!=[(a["name"][6:],"rotation")]:
   raise ValueError("Rodadura no corresponde a su rueda: "+fn)
 paints={m.get("name"):m.get("pbrMetallicRoughness",{}).get("baseColorFactor") for m in raw.get("materials",[])}
 if key=="hilux" and (not paints.get("pintura") or max(paints["pintura"][:3])>=.04):raise ValueError("Falta el grafito profundo")
 if key=="landcruiser" and (not paints.get("pintura") or paints["pintura"][0]<.45):raise ValueError("Falta el rojo intenso")
 return {"id":key,"file":fn,"bytes":len(data),"sha256":hashlib.sha256(data).hexdigest(),"radius":radius,
         "type":"camioneta" if key in ("hilux","landcruiser") else "moto",
         "animations":names,"wheels":list(wheels),"steering":list(steering),"forward":"-X","up":"Y"}

def install(source,dest):
 with zipfile.ZipFile(source) as z:
  names=[n for n in z.namelist() if n.lower().endswith(".glb")]
  if len(names)!=4 or set(names)!={x[0] for x in VEHICLES.values()}:
   raise ValueError("Solo se aceptan los cuatro GLB finales")
  models=[(verify(z.read(info[0]),key),z.read(info[0])) for key,info in VEHICLES.items()]
 for info,content in models:
  file=dest/info["file"]
  if file.exists() and hashlib.sha256(file.read_bytes()).hexdigest()!=info["sha256"]:
   raise FileExistsError("No sobrescribir un vehículo distinto: "+str(file))
 dest.mkdir(parents=True,exist_ok=True)
 for info,content in models:
  path=dest/info["file"]
  if not path.exists():path.write_bytes(content)
 output={"schemaVersion":1,"vehicleModels":4,"oldVehicleModels":0,"assetsBase":"./assets/vehicles-v4/","vehicles":[x for x,_ in models]}
 (dest/"vehicles-v4.json").write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
 return output

if __name__=="__main__":
 p=argparse.ArgumentParser();p.add_argument("zip",type=Path);p.add_argument("--output",type=Path,default=Path("game/assets/vehicles-v4"))
 args=p.parse_args();print(json.dumps(install(args.zip,args.output),ensure_ascii=False))
