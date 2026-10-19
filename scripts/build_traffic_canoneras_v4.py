#!/usr/bin/env python3
"""Integra dos caponeras y tráfico nuevo en un único HTML con el mapa original.

Requiere un HTML V4 previo que ya contenga 10 personajes y 4 vehículos
nuevos. Nunca modifica el original ni publica en main.
"""
from __future__ import annotations
import argparse,base64,gzip,hashlib,json,re,struct,zipfile
from pathlib import Path

CAPONERAS=(
 ("mototaxi-roja","01-Mototaxi-roja.glb","Mototaxi roja",
  ("Rueda_Delantera","Rueda_Trasera_Der","Rueda_Trasera_Izq"),("Direccion",)),
 ("canonera-abierta","02-Canonera-abierta.glb","Caponera abierta",
  ("Rueda_Frontal_Der","Rueda_Frontal_Izq","Rueda_Trasera"),
  ("Direccion_Frontal_Der","Direccion_Frontal_Izq","Manubrio"))
)
VEHICLES=("hilux","landcruiser","pulsar","taypan","mototaxi-roja","canonera-abierta")

def replace_one(source,old,new):
    if source.count(old)!=1:
        raise ValueError("El HTML base ya no coincide: "+old[:85])
    return source.replace(old,new,1)

def inspect_glb(key,filename,data,wheels,steering):
    if len(data)<20 or data[:4]!=b"glTF" or struct.unpack_from("<I",data,8)[0]!=len(data):
        raise ValueError("GLB inválido: "+filename)
    size,kind=struct.unpack_from("<II",data,12)
    if kind!=0x4e4f534a:raise ValueError("Falta bloque JSON del GLB")
    document=json.loads(data[20:20+size])
    nodes=[node.get("name") for node in document.get("nodes",[])]
    clips={a.get("name"):a for a in document.get("animations",[])}
    required={"Direccion_Izquierda","Direccion_Derecha","Rodar_y_Doblar"}|{"Rodar_"+w for w in wheels}
    if set(clips)!=required or any(nodes.count(name)!=1 for name in (*wheels,*steering)):
        raise ValueError("Ruedas/animaciones incompletas: "+filename)
    for wheel in wheels:
        channels=clips["Rodar_"+wheel]["channels"]
        if len(channels)!=1 or nodes[channels[0]["target"]["node"]]!=wheel or channels[0]["target"]["path"]!="rotation":
            raise ValueError("Rodadura de rueda inválida")
    for direction in ("Direccion_Izquierda","Direccion_Derecha"):
        actual={nodes[c["target"]["node"]] for c in clips[direction]["channels"]}
        if actual!=set(steering):raise ValueError("Manubrio o dirección inválidos")
    if key=="mototaxi-roja" and not any(
        c["target"]["path"]=="weights" for c in clips["Rodar_y_Doblar"]["channels"]
    ):raise ValueError("Falta ondulación de bandera roja")
    return {"id":key,"name":("Mototaxi roja" if key=="mototaxi-roja" else "Caponera abierta"),
            "file":filename,"type":"caponera","radius":.30,
            "wheels":list(wheels),"steering":list(steering),"animations":list(clips),
            "sha256":hashlib.sha256(data).hexdigest(),"bytes":len(data)}

def build(original:Path,source_zip:Path,output:Path,traffic_js:Path):
    if original.resolve()==output.resolve():raise ValueError("No sobrescribir original")
    if output.exists():raise FileExistsError(output)
    html=original.read_text("utf8")
    tag=re.search(r'(<script\b[^>]*id="specifications"[^>]*>)(.*?)(</script>)',html,re.S)
    if not tag:raise ValueError("No hay catálogo V4 original")
    spec=json.loads(tag[2])
    if len(spec["characters"])!=10 or tuple(v["id"] for v in spec["vehicles"])!=VEHICLES[:4]:
        raise ValueError("Se esperaban 10 personajes y 4 vehículos V4")
    if any(name in html for name in ("asset-humans","asset-vehicles","asset-animation38","asset-actor-motion")):
        raise ValueError("El HTML base todavía empaqueta medios antiguos")
    additions=[]
    with zipfile.ZipFile(source_zip) as archive:
        glbs=[n for n in archive.namelist() if n.lower().endswith(".glb")]
        if set(glbs)!={x[1] for x in CAPONERAS} or len(glbs)!=2:
            raise ValueError("El ZIP debe contener exactamente dos caponeras")
        for key,filename,name,wheels,steering in CAPONERAS:
            raw=archive.read(filename)
            spec["vehicles"].append(inspect_glb(key,filename,raw,wheels,steering))
            encoded=base64.b64encode(gzip.compress(raw,compresslevel=9,mtime=0)).decode()
            additions.append('<script type="application/octet-stream" id="data-'+key+'">'+encoded+'</script>')
    html=html[:tag.start(2)]+json.dumps(spec,ensure_ascii=False,separators=(",",":"))+html[tag.end(2):]
    anchor=re.search(r'<script\b[^>]*id="data-taypan"[^>]*>.*?</script>',html,re.S)
    if not anchor:raise ValueError("Modelo Taypan original ausente")
    html=html[:anchor.end()]+"\n"+"\n".join(additions)+html[anchor.end():]
    runtime=next((m for m in re.finditer(r'<script\b([^>]*)>(.*?)</script>',html,re.S)
                 if 'id=' not in m[1] and "'use strict'" in m[2][:80]),None)
    if runtime is None:raise ValueError("No existe el controlador V4")
    app=runtime[2]
    changes=[
      ("const state={scene:","const state={traffic:[],scene:"),
      ("const positions=[[-34,0,111],[-28,0,111],[-34,0,124],[-28,0,124]];",
       "const positions=[[-34,0,111],[-28,0,111],[-34,0,124],[-28,0,124],[-38,0,138],[-30,0,139]];"),
      ("for(let i=0;i<4;i++){\n  const c=state.cars[i],spec=specs.vehicles[i]",
       "for(let i=0;i<6;i++){\n  const c=state.cars[i],spec=specs.vehicles[i]"),
      ("c.info?.type==='moto'?.5:1.1",
       "c.info?.type==='moto'?.5:c.info?.type==='caponera'?.75:1.1"),
      ("c.wheelbase=spec.type==='moto'?1.36:3.03;\n  c.width=spec.type==='moto'?.9:1.98;c.max=spec.type==='moto'?18:25;",
       "c.wheelbase=spec.type==='moto'?1.36:spec.type==='caponera'?1.83:3.03;\n  c.width=spec.type==='moto'?.9:spec.type==='caponera'?1.42:1.98;c.max=spec.type==='moto'?18:spec.type==='caponera'?14:25;"),
      ("state.people=[];state.cars=[];","state.people=[];state.cars=[];state.traffic=[];"),
      ("for(let i=0;i<4;i++){\n   const v=specs.vehicles[i];progress('Cargando '+v.name+' ('+(i+1)+'/4 vehículos)…',67+(i+1)*7.3);",
       "for(let i=0;i<6;i++){\n   const v=specs.vehicles[i];progress('Cargando '+v.name+' ('+(i+1)+'/6 vehículos)…',64+(i+1)*5.1);"),
      ("spawnVehicles();state.ready=true;","spawnVehicles();initTrafficV4();state.ready=true;"),
      ("'¡Listo! Ciudad original de Managua · Mateo y 9 NPC · 4 vehículos nuevos'",
       "'¡Listo! Managua original · Mateo y 9 NPC · 6 vehículos nuevos con tráfico real'"),
      ("  for(const wheel of c.info.wheels)anim(c,'Rodar_'+wheel,((c.roll/(2*Math.PI))%1+1)%1);\n  anim(c,c.steer>=0?'Direccion_Derecha':'Direccion_Izquierda',Math.min(.5,Math.abs(c.steer)*.5));",
       "  animateVehicleV4(c,0);"),
      ("'MAPA ORIGINAL · 10 PERSONAS · 4 VEHÍCULOS'",
       "'MAPA ORIGINAL · 10 PERSONAS · 6 VEHÍCULOS'"),
      ("for(const car of state.cars){const dx=car.root.position.x-here.root.position.x",
       "for(const car of [...state.cars,...state.traffic]){const dx=car.root.position.x-here.root.position.x"),
      ("'Acercate a una moto o camioneta y tocá SUBIR'",
       "'Acercate a un vehículo nuevo y tocá SUBIR'"),
      ("state.driving=state.near;state.driving.speed=0;state.driving.steer=0;state.driving.physics=null;",
       "state.driving=state.near;state.driving.speed=0;state.driving.steer=0;state.driving.physics=null;state.driving.controlUser=true;"),
      ("hero.root.setEnabled(true);state.driving=null;hero.play('Idle');",
       "hero.root.setEnabled(true);if(car.traffic){car.controlUser=false;car.trafficPause=3.5;}state.driving=null;hero.play('Idle');"),
      ("meta:{mass:c.info.type==='moto'?155:2300}",
       "meta:{mass:c.info.type==='moto'?155:c.info.type==='caponera'?440:2300}"),
      ("window.NaguaV4={get originalCity()",
       "window.NaguaV4={get traffic(){return state.traffic;},get originalCity()"),
      ("function initEngine(){",traffic_js.read_text("utf8")+"\nfunction initEngine(){")
    ]
    for old,new in changes:app=replace_one(app,old,new)
    begin=app.index(" // Staged NPCs walk on the sidewalks.")
    end=app.index(" updateCamera(dt);updateInfo();",begin)
    app=app[:begin]+" updatePedestriansV4(dt);\n updateTrafficV4(dt);\n"+app[end:]
    html=html[:runtime.start(2)]+app+html[runtime.end(2):]
    html=html.replace("10 PERSONAS · 4 VEHÍCULOS","10 PERSONAS · 6 VEHÍCULOS").replace(
        "cuatro vehículos","seis vehículos").replace("4 vehículos","6 vehículos").replace(
        "14 modelos","16 modelos")
    assert len(re.findall(r'id="data-',html))==16
    assert len(re.findall(r'id="city-zone-',html))==119
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(html,encoding="utf8")
    return {"characters":10,"vehicleModels":6,"trafficInstances":6,"npc":9,
            "bytes":output.stat().st_size,"sha256":hashlib.sha256(output.read_bytes()).hexdigest()}

if __name__=="__main__":
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--base",type=Path,required=True,help="HTML V4 original de 10 + 4")
    p.add_argument("--caponeras",type=Path,required=True,help="ZIP del usuario con 2 GLB")
    p.add_argument("--out",type=Path,required=True,help="HTML único, archivo NUEVO")
    p.add_argument("--traffic-js",type=Path,default=Path(__file__).resolve().parents[1]/"game/v4/traffic-canoneras.js")
    args=p.parse_args()
    print(json.dumps(build(args.base,args.caponeras,args.out,args.traffic_js),ensure_ascii=False))
