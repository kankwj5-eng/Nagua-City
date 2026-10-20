"""Combina zona urbana ORIGINAL + 10 personas y 4 vehículos en un solo HTML.

No empaqueta ni conserva recursos de personajes, vehículos o animaciones viejas.
Artefacto integrado de validación: no sustituye aún todo el sistema de misiones.
"""
from __future__ import annotations
import argparse,base64,gzip,hashlib,json,re,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OPEN=re.compile(rb'<script\b[^>]*id="(?P<id>asset-[a-z0-9-]+)"[^>]*>(?P<data>.*?)</script>',re.S|re.I)

def safe_json(o):
    return json.dumps(o,separators=(',',':'),ensure_ascii=False).replace('<','\\u003c')

def source_assets(path):
    # One-pass regex over 180+MB, with no giant temporary copies of every asset.
    source=path.read_bytes()
    if source[:2]==b'\x1f\x8b':source=gzip.decompress(source)
    wanted={b'asset-world',b'asset-extensions',b'asset-data'}
    found={m.group('id'):m.group('data').strip() for m in OPEN.finditer(source) if m.group('id') in wanted}
    if set(found)!=wanted:raise ValueError('Missing original world/extension/data catalogs: '+str(wanted-set(found)))
    result={}
    for key in (b'asset-world',b'asset-extensions'):
        result[key.decode()[6:]]=json.loads(gzip.decompress(base64.b64decode(found[key])))
    result['data']=json.loads(base64.b64decode(found[b'asset-data']))
    return result

def scripts_from_catalogs(raw):
    tags=[];sizes={};counts={}
    for kind in ('world','extensions'):
        catalog=raw[kind]
        counts[kind]={'zones':len(catalog['zones']),'images':len(catalog['images']),'materials':len(catalog['materials'])}
        for i,z in enumerate(catalog['zones']):
            payload=z.pop('data')
            if not payload or '<' in payload:raise ValueError('Invalid packed zone '+str(i))
            tags.append(f'<script type="application/octet-stream" id="city-zone-{kind}-{i}">{payload}</script>')
            sizes['zones']=sizes.get('zones',0)+len(payload)
        for i,image in enumerate(catalog['images']):
            payload=image if kind=='world' else image.pop('data')
            if not payload or '<' in payload:raise ValueError('Invalid texture '+str(i))
            catalog['images'][i]={'stored':True} if kind=='world' else image
            tags.append(f'<script type="application/octet-stream" id="city-image-{kind}-{i}">{payload}</script>')
            sizes['images']=sizes.get('images',0)+len(payload)
        tags.append(f'<script type="application/json" id="city-meta-{kind}">{safe_json(catalog)}</script>')
    # Keep only terrain and collision geometry; exclude all old vehicle/NPC definitions.
    data=raw['data']
    clean={'surfaces':data.get('surfaces',[]),'boxes':data.get('boxes',[])}
    counts['terrain']={'surfaces':len(clean['surfaces']),'colliders':len(clean['boxes'])}
    tags.append(f'<script type="application/json" id="city-data">{safe_json(clean)}</script>')
    return tags,counts,sizes

def patch_demo(html,runtime):
    anchor='function installCity(){';end='async function modelLoad(id){'
    a=html.find(anchor);b=html.find(end,a)
    if a<0 or b<0:raise ValueError('Demo entrypoint layout changed')
    html=html[:a]+runtime+'\nfunction installCity(){state.officialCity=new OfficialCityV4(B(),state.scene);}\n'+html[b:]
    old="initEngine();progress('Abriendo la ciudad de pruebas…',13);"
    new="initEngine();progress('Cargando calles y edificios ORIGINALES de Managua…',13);await state.officialCity.stream(-37,111,true);"
    if html.count(old)!=1:raise ValueError('Cannot link original world boot')
    html=html.replace(old,new,1)
    html=html.replace("const positions=[[5,0,19],[13,0,19],[5,0,35],[13,0,35]];",
      "const positions=[[-34,0,111],[-28,0,111],[-34,0,124],[-28,0,124]];",1)
    html=html.replace('c.root.position.set(...pos);c.visual.rotation.y=-Math.PI/2;',
      'const xy=state.officialCity.findSpace(pos[0],pos[2],c.info?.type===\'moto\'?.5:1.1);c.root.position.set(xy[0],state.officialCity.groundAt(...xy),xy[1]);c.visual.rotation.y=-Math.PI/2;',1)
    html=html.replace("start.root.position.set(-4,0,10);",
      "{const p=state.officialCity.findSpace(-37,111,.34);start.root.position.set(p[0],state.officialCity.groundAt(...p),p[1]);}",1)
    html=html.replace('const positions=[[-11,-4],[-11,6],[-11,16],[-11,28],[-11,40],[11,-48],[11,-38],[11,-28],[11,-14]];',
      'const positions=[[-45,95],[-45,111],[-45,126],[-45,140],[-46,155],[-25,95],[-25,106],[-25,125],[-25,141]];',1)
    html=html.replace('p.root.position.set(positions[i][0],0,positions[i][1]);',
      'const coord=state.officialCity.findSpace(...positions[i],.26);p.root.position.set(coord[0],state.officialCity.groundAt(...coord),coord[1]);',1)
    html=html.replace('if(Math.abs(nextX)<104&&Math.abs(nextZ)<110){p.root.position.x=nextX;p.root.position.z=nextZ;}',
      'if(!state.officialCity.blocked(nextX,nextZ,.33)){p.root.position.x=nextX;p.root.position.z=nextZ;p.root.position.y=state.officialCity.groundAt(nextX,nextZ);}',1)
    html=html.replace('if(Math.abs(nextX)<105&&Math.abs(nextZ)<110){c.root.position.x=nextX;c.root.position.z=nextZ;}',
      'if(!state.officialCity.blocked(nextX,nextZ,c.width*.40)){c.root.position.x=nextX;c.root.position.z=nextZ;c.root.position.y=state.officialCity.groundAt(nextX,nextZ);}',1)
    html=html.replace('p.root.position.z+=p.walkDirection*p.speed*dt;',
      'const nz=p.root.position.z+p.walkDirection*p.speed*dt;if(!state.officialCity.blocked(p.root.position.x,nz,.26)){p.root.position.z=nz;p.root.position.y=state.officialCity.groundAt(p.root.position.x,nz);}else p.walkDirection*=-1;',1)
    html=html.replace('if(p.root.position.z<-66||p.root.position.z>62)p.walkDirection*=-1;',
      'if(p.root.position.z<90||p.root.position.z>156)p.walkDirection*=-1;',1)
    html=html.replace('hero.root.position.set(p.x+Math.cos(car.heading)*2.8,0,p.z-Math.sin(car.heading)*2.8);',
      'const q=state.officialCity.findSpace(p.x+Math.cos(car.heading)*2.8,p.z-Math.sin(car.heading)*2.8,.35);hero.root.position.set(q[0],state.officialCity.groundAt(...q),q[1]);',1)
    # Original Nagua City vehicle physics (no old meshes, textures or animations).
    physics=(ROOT/'game/src/state/0001-physics40.js').read_text(encoding='utf8')+'\n'+(ROOT/'game/src/vehicles/0005-driving.js').read_text(encoding='utf8')
    html=html.replace('function step(dt){',physics+'\nfunction step(dt){',1)
    begin=html.index(' if(state.driving){',html.index('function step(dt){'))
    finish=html.index(' }else{',begin)
    original=""" if(state.driving){
  const c=state.driving,v={bike:c.info.type==='moto',bus:false,bicycle:false,radius:c.info.radius,
   wheelbase:c.wheelbase,width:c.width,maxSpeed:c.max,meta:{mass:c.info.type==='moto'?155:2300}};
  if(!c.physics){c.physics={x:c.root.position.x,z:c.root.position.z,
    heading:c.heading,speed:c.speed||0,steer:0,lean:0,wheelie:0,gear:1,throttle:0};}
  Driving.advance(c.physics,{throttle:forward,steer:side,brake:pressed('brake')?1:0},v,dt);
  const nextX=c.physics.x,nextZ=c.physics.z;
  if(!state.officialCity.blocked(nextX,nextZ,c.width*.4)){
   c.root.position.x=nextX;c.root.position.z=nextZ;c.root.position.y=state.officialCity.groundAt(nextX,nextZ);
  }else{c.physics.x=c.root.position.x;c.physics.z=c.root.position.z;c.physics.speed=0;}
  c.speed=c.physics.speed;c.heading=c.physics.heading;c.steer=c.physics.steer/.58;
  c.root.rotation.y=c.heading;
  c.roll+=(c.speed*dt)/c.info.radius;
  for(const wheel of c.info.wheels)anim(c,'Rodar_'+wheel,((c.roll/(2*Math.PI))%1+1)%1);
  anim(c,c.steer>=0?'Direccion_Derecha':'Direccion_Izquierda',Math.min(.5,Math.abs(c.steer)*.5));
"""
    html=html[:begin]+original+html[finish:]
    html=html.replace('state.driving=state.near;state.driving.speed=0;state.driving.steer=0;',
      'state.driving=state.near;state.driving.speed=0;state.driving.steer=0;state.driving.physics=null;',1)
    html=html.replace('scene.fogStart=78;scene.fogEnd=133;','scene.fogStart=115;scene.fogEnd=280;',1)
    html=html.replace('camera.maxZ=350;','camera.maxZ=1100;',1)
    html=html.replace('state.last=now;\n  try{step(dt);scene.render();}',
       'state.last=now;\n  try{step(dt);const focus=state.driving||state.player;if(focus&&now-state.officialCity.lastStream>500){state.officialCity.lastStream=now;state.officialCity.stream(focus.root.position.x,focus.root.position.z).catch(console.error);}scene.render();}',1)
    html=html.replace("tell('¡Listo! Mateo y los 9 NPC · 4 vehículos nuevos');",
       "tell('¡Listo! Ciudad original de Managua · Mateo y 9 NPC · 4 vehículos nuevos');",1)
    html=html.replace("'10 PERSONAJES · 4 VEHÍCULOS'","'MAPA ORIGINAL · 10 PERSONAS · 4 VEHÍCULOS'",1)
    html=html.replace('<strong>Versión HTML V4 de prueba.</strong>', '<strong>Integración V4 con el mapa original de Nagua City.</strong>',1)
    html=html.replace('Es una escena jugable de integración. La ciudad y las misiones completas del juego original aún no están incorporadas en esta versión.', 'Esta versión incorpora las zonas originales del mapa, las colisiones y los 14 modelos nuevos. El resto de las misiones y sistemas todavía está en migración.',1)
    html=html.replace('no incluye todavía el mapa completo, tráfico, misiones y restantes funciones de la versión pública', 'incorpora el mapa original por zonas, pero no incluye todavía las misiones, el tráfico completo ni todas las funciones de la versión pública',1)
    html=html.replace('window.NaguaV4={get ready()',
       'window.NaguaV4={get originalCity(){return state.officialCity?.inspect();},get ready()',1)
    if 'No son los mapas originales' in html:raise ValueError('Old demo city remains')
    return html

def build(source:Path,demo:Path,runtime:Path,out:Path):
    base=demo.read_text(encoding='utf8')
    tags,counts,sizes=scripts_from_catalogs(source_assets(source))
    modified=patch_demo(base,runtime.read_text(encoding='utf8'))
    inject='\n'.join(tags)
    if '</body>' not in modified:raise ValueError('Demo document incomplete')
    modified=modified.replace('</body>',inject+'\n</body>',1)
    if 'asset-humans' in modified or 'asset-vehicles' in modified or 'asset-animation38' in modified:
        raise ValueError('Old human/vehicle packs leaked into the new HTML')
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(modified,encoding='utf8')
    report={'output':out.name,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),
      'catalogs':counts,'catalogEncodedBytes':sizes,'embeddedNewModels':14,'oldCharacterModels':0,
      'oldVehicleModels':0,'source':'original Nagua City LFS world/extension zones; own v4 actors/fleet',
      'fullLegacyMissions':False,'singleHTML':True}
    (out.parent/'nagua-original-v4-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    return report

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source',type=Path,default=ROOT/'Managua_Del_taller_al_lago(1).html')
    p.add_argument('--demo',type=Path,default=ROOT/'dist/Nagua-City-V4-14-Modelos.html')
    p.add_argument('--runtime',type=Path,default=ROOT/'game/v4/official-city.js')
    p.add_argument('--output',type=Path,default=ROOT/'dist/original-v4/Nagua-City-Original-V4.html')
    args=p.parse_args()
    print(json.dumps(build(args.source,args.demo,args.runtime,args.output),ensure_ascii=False))
