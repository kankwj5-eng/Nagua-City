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
    """El código del juego original se edita en game/src directamente.

    No aplicar parches heredados sobre los módulos ya sustituidos: convertiría
    el runtime nuevo en una mezcla de modelos anteriores y actuales.
    """
    checks=("const originalV4=(()=>","await originalV4.prepare('cars')",
            "await originalV4.prepare('people')","function makeHuman(",
            "function createVehicle(","function installFleet(")
    for token in checks:
        if token not in app:
            raise ValueError("Módulo V4 original incompleto: "+token)
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