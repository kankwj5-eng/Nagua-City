#!/usr/bin/env python3
"""Create an *experimental* portable V4 from the genuine modular Managua HTML.

Never overwrites the supplied original; retains original world, lights, shaders,
textures, environment, camera, and city geometry. Removes legacy character and
vehicle *models* and replaces them with exactly ten new human GLB and six vehicle
GLB. This staging build is NOT published automatically.
"""
from pathlib import Path
import argparse, base64, gzip, hashlib, json, re

ASSET_ID = re.compile(rb'<script\b(?P<attrs>[^>]*\bid="(?P<id>[^"]+)"[^>]*)>(?P<body>.*?)</script>', re.I|re.S)
NEW_IDS=['01_mateo','02_ernesto','03_daniel','04_luis','05_rafael','06_valeria','07_marisol','08_xiomara','09_rosa','10_elena','hilux','landcruiser','pulsar','taypan','mototaxi-roja','canonera-abierta']
OLD_ASSETS={'asset-humans','asset-animation38','asset-actor-motion','pack48-humans'}
OLD_PREFIX=('resource48-humans-',)

def replace_exact(src: str, search: str, replacement: str, label: str):
    count=src.count(search)
    if count!=1: raise ValueError(f'{label}: expected once, got {count}, sample {search[:100]}')
    return src.replace(search,replacement,1)

def patch_app(app):
    # Keep the city initialization itself byte-for-byte; replace *only* legacy
    # model setup and model-dependent installation, never camera/light/world.
    app=replace_exact(app,"vehicleAssets=await loadAsset('vehicles');","vehicleAssets=await loadAsset('vehicles');",'vehicle palette')
    app=replace_exact(app,"await createTemplates();","if(!originalV4.exists())await createTemplates();",'vehicle templates')
    app=replace_exact(app,"const mobileBoot49=matchMedia('(pointer:coarse)').matches;","const mobileBoot49=matchMedia('(pointer:coarse)').matches||originalV4.exists();",'no batching for v4 models')
    app=replace_exact(app,"await prepareAnimations38();","if(!originalV4.exists())await prepareAnimations38();",'old human animations')
    app=replace_exact(app,"await prepareWardrobe25();","if(!originalV4.exists())await prepareWardrobe25();",'old wardrobe texture')
    app=replace_exact(app,"await preparePoliceUniforms();","if(!originalV4.exists())await preparePoliceUniforms();",'old police texture')
    for fn in ('installArms24()','installGrips26()','installRiders26()','installHumans26()','installPeople28()','installCombatPose29()','installPose30()'):
        # skips model-specific rig and wardrobe upgrades, not their surrounding city
        needle=fn+';'
        app=replace_exact(app,needle,'if(!originalV4.exists())'+needle,fn)
    # Existing original UI menus contain retired car names. Start with the
    # nearest authentic V4 vehicle and map menu selections later.
    app=replace_exact(app,"ready=true;selectModel(selected);","ready=true;if(originalV4.exists())selected='hilux';selectModel(selected);",'initial garage model')
    app=replace_exact(app,"function applyCityOutfit(){","function applyCityOutfit(){if(originalV4.exists())return;",'legacy outfits')
    app=replace_exact(app,"async function prepare43(){","async function prepare43(){if(originalV4.exists())return;",'legacy skeleton extra prep')
    # Keep the HIGH-QUALITY city additions while skipping modifications to obsolete rigs.
    app=replace_exact(app,"function install41(){","function install41(){if(originalV4.exists()){neighborhood41();return;}", 'skip old skeleton cache 41')
    app=replace_exact(app,"vehicleFinish42();locomotion42();","vehicleFinish42();if(!originalV4.exists())locomotion42();",'keep quality lighting42')
    app=replace_exact(app,"function installTechnical44(){","function installTechnical44(){if(originalV4.exists()){stage35.settings.mode='auto';$('adaptive35').value='auto';resetBudget35();refreshZones25=refreshZones44;updateHouseDetails=updateHouses44;return;}", 'avoid retired animation release')
    v4_visuals="""if(originalV4.exists()){
      const leafEl=$('asset-leaf46');
      art46.leafTexture=await loadTexture('data:image/webp;base64,'+leafEl.textContent,false);
      art46.leafTexture.hasAlpha=true;art46.leafTexture.gammaSpace=true;leafEl.remove();
      materials46();gardens46();compactGeometry46();
      scene.skipPointerMovePicking=true;scene.skipPointerDownPicking=true;scene.skipPointerUpPicking=true;
      return;
    }
    """
    app=replace_exact(app,"async function install46(){","async function install46(){"+v4_visuals,'preserve gardens and materials46')
    # Preserve native garage layout while replacing its retired vehicle choices.
    extra="""if(originalV4.exists()){
      const list=$('modelchoices');list.replaceChildren();
      for(const item of originalV4.spec().vehicles){
        const button=document.createElement('button');
        button.dataset.model=item.id;button.textContent=item.name||item.id;
        list.append(button);
      }
    }"""
    app=replace_exact(app,"settings();bind();bindStage21();", "settings();"+extra+"bind();bindStage21();",'garage V4 selection')
    # The original garage filtering uses old categories; keep six new names in
    # their appropriate categories, rather than rendering 20 defunct buttons.
    app=replace_exact(app,"function repaint(v,color){","function repaint(v,color){if(v?.v4)return;",'keep GLB original paint colors')
    # Preserve missions and original buildings, but do not create 9 legacy
    # garage variants and recolored caponera meshes from the previous fleet.
    start=app.index(" const colors=['red','blue','green','yellow','orange'];for(const [i,color] of colors.entries())",app.index('function installWorld30()'))
    stop=app.index(" for(const t of city.territories)",start)
    app=app[:start]+" if(!originalV4.exists()){\n"+app[start:stop]+" }\n"+app[stop:]
    # Keep original car paint palette as shared city material data, but declare
    # only the 6 new selectable vehicles in the garage/technical profile.
    profile="""if(originalV4.exists()){
      for(const info of originalV4.spec().vehicles){
       const id=info.id,type=info.type,cc=type==='moto'?150:0;
       descriptions[id]=[info.name||id,'Modelo nuevo con geometría, texturas y animaciones GLB originales',
        type==='moto'?'Motocicleta':type==='caponera'?'Mototaxi nicaragüense':'Camioneta 4×4'];
       VEHICLE_PROFILES[id]={label:info.name||id,variant:descriptions[id][2],source:null,
        massKg:null,runningMassKg:type==='moto'?160:type==='caponera'?440:2300,
        hp:type==='moto'?19:type==='caponera'?12:140,
        torqueNm:type==='moto'?15:type==='caponera'?12:400,
        gears:type==='moto'?5:6,engine:type==='moto'||type==='caponera'?'Motor simulado 4T':'Motor simulado 4×4',cc,
        note:'Parámetros jugables de prueba; no homologación',maxSpeed:type==='moto'?28:type==='caponera'?14:33};
      }
    }"""
    app=replace_exact(app,"await installFleet();",profile+"await installFleet();",'new vehicle menu/profiles')
    # Preserve the original GLB geometry and its motion clips; only furnish
    # empty compatibility transform nodes for chassis and wheel-suspension math.
    app=replace_exact(app,"parts:{steering}","parts:{steering,body:visual}", 'vehicle body compatibility')
    # Create V4 vehicles using the ORIGINAL traffic entries and spawning lanes.
    anchor="async function installFleet(){"
    fleet_js="""if(originalV4.exists()){
      await originalV4.prepare('cars');
      let id=0;
      const ids=originalV4.spec().vehicles.map(v=>v.id);
      for(const d of selectStreetFleet28(data.fleet)){
        if(id>=36)break;
        await loadYield25();
        if(!inWorld(d.x,d.z))continue;
        const name=ids[id%ids.length];
        const v=createVehicle(name,d.x,d.z,d.angle||0,id++);
        v.traffic=true;
        v.route={axis:Math.abs(d.x+37)<12?'z':'x',lane:Math.abs(d.x+37)<12?d.x:d.z,min:-195,max:195,target:1};
      }
      const positions=[[-34,111],[-29.5,111],[-24,111],[-19,111],[-34,123],[-28,123]];
      for(let i=0;i<6;i++){
        const v=createVehicle(ids[i],positions[i][0],positions[i][1],0,id++);
        v.garage=true;
      }
      current=fleet.find(v=>v.garage&&v.name==='hilux');
      return;
    }
    """
    app=replace_exact(app,anchor,anchor+fleet_js,'genuine fleet insertion')
    # New animations own their own wheels: no legacy wheel mesh rotations.
    for code,repl in (
      ("function createVehicle(name,x,z,heading=0,id=0){","function createVehicle(name,x,z,heading=0,id=0){if(originalV4.exists())return originalV4.makeCar(name,x,z,heading,id);"),
      ("function applyPlayerWheels13(v,s,dt){","function applyPlayerWheels13(v,s,dt){if(v?.v4){originalV4.animateWheels(v,s.speed,s.steer,dt);return;}"),
      ("function resetPose(p){","function resetPose(p){if(p?.v4){renderRestore=null;renderPrevious=null;originalV4.restorePerson(p);return;}"),
      ("function humanWalk(p,speed,dt){","function humanWalk(p,speed,dt){if(p?.v4){originalV4.setClip(p,speed>2.5?'Run':speed>.08?'Walk':'Idle');return;}"),
    ):
      if repl not in app:
        app=replace_exact(app,code,repl,'v4 compatibility')
    return app

def build(original:Path, models:Path, output:Path):
    if output.resolve() in (original.resolve(),models.resolve()): raise ValueError('Never overwrite source')
    if output.exists():raise FileExistsError(output)
    # content text is ASCII for base64 zones, UTF8 for game app.
    main=original.read_bytes();package=models.read_bytes()
    new_tags={};model_specs=None
    for m in ASSET_ID.finditer(package):
        key=m.group('id').decode('ascii')
        if key=='specifications':model_specs=json.loads(m.group('body'))
        if key.startswith('data-') and key[5:] in NEW_IDS:
            new_tags[key[5:]]=m.group(0)
    if set(new_tags)!=set(NEW_IDS) or model_specs is None:
        raise ValueError('Need exactly 10 new character GLBs and 6 new vehicle GLBs')
    assert [r['id'] for r in model_specs['characters']+model_specs['vehicles']]==NEW_IDS
    expected_hashes={r['id']:r['sha256'] for r in model_specs['characters']+model_specs['vehicles']}
    for item,tag in new_tags.items():
        body=ASSET_ID.search(tag).group('body')
        glb=gzip.decompress(base64.b64decode(body))
        if glb[:4]!=b'glTF' or hashlib.sha256(glb).hexdigest()!=expected_hashes[item]:
            raise ValueError('Damaged GLB: '+item)
    palettes=[];old_model_count=0;removed=[]
    def replace(tag):
        nonlocal old_model_count
        key=tag.group('id').decode('ascii')
        if key=='asset-vehicles':
            old=json.loads(gzip.decompress(base64.b64decode(tag.group('body'))))
            old_model_count=len(old['models'])
            preserved={'models':{},'lod':{},'materials':old['materials'],'equipment':{}}
            raw=gzip.compress(json.dumps(preserved,separators=(',',':')).encode(),mtime=0)
            encoded=base64.b64encode(raw)
            return tag.group(0)[:tag.start('body')-tag.start()]+encoded+b'</script>'
        if key in OLD_ASSETS or key.startswith(OLD_PREFIX):
            removed.append(key);return b''
        if key=='appSource':
            patched=patch_app(tag.group('body').decode('utf8')).encode('utf8')
            return tag.group(0)[:tag.start('body')-tag.start()]+patched+b'</script>'
        return tag.group(0)
    cleaned=ASSET_ID.sub(replace,main)
    if old_model_count<10 or len(removed)<10:raise ValueError('Legacy assets not found')
    specs=b'<script type="application/json" id="v4-original-specifications">'+json.dumps(model_specs,separators=(',',':'),ensure_ascii=False).encode('utf8')+b'</script>'
    new_scripts=b'\n'.join([specs]+[new_tags[k].replace(b'id="data-'+k.encode()+b'"',b'id="v4-original-'+k.encode()+b'"') for k in NEW_IDS])
    anchor=b'</body>'
    if cleaned.count(anchor)!=1:raise ValueError('HTML body structure changed')
    cleaned=cleaned.replace(anchor,new_scripts+b'\n'+anchor,1)
    remaining={m.group('id').decode('ascii') for m in ASSET_ID.finditer(cleaned)}
    if remaining.intersection(OLD_ASSETS) or any(x.startswith(OLD_PREFIX) for x in remaining):
        raise ValueError('Old media script blocks remain')
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_bytes(cleaned)
    return {'output':str(output),'bytes':len(cleaned),'originalBytes':len(main),'oldModelCount':old_model_count,'removedTags':len(removed),'characters':10,'vehicles':6,'sha256':hashlib.sha256(cleaned).hexdigest()}

if __name__=='__main__':
    a=argparse.ArgumentParser()
    a.add_argument('--original',type=Path,required=True)
    a.add_argument('--models',type=Path,required=True)
    a.add_argument('--output',type=Path,required=True)
    x=a.parse_args();print(json.dumps(build(x.original,x.models,x.output),ensure_ascii=False,indent=2))