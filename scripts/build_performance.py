"""Apply one reviewed block to the official LFS HTML with bounded buffers."""
from pathlib import Path
import argparse,re,json,hashlib,mmap
ROOT=Path(__file__).resolve().parents[1]
BLOCK='animation-buffer-packing'
OPEN=b'<script id="appSource" type="text/plain">'
CHUNK=1024*1024

def locate(path):
 with path.open('rb') as f,mmap.mmap(f.fileno(),0,access=mmap.ACCESS_READ) as data:
  tag=data.find(OPEN)
  if tag<0:raise ValueError('No se encontró appSource. Descargá el archivo real de Git LFS.')
  start=tag+len(OPEN);end=data.find(b'</script>',start)
  if end<0:raise ValueError('appSource incompleto')
  return start,end,data[start:end].decode('utf-8')

def digest(path,ranges=None):
 h=hashlib.sha256()
 with path.open('rb') as f:
  for start,end in ranges or [(0,path.stat().st_size)]:
   f.seek(start);left=end-start
   while left:
    chunk=f.read(min(CHUNK,left))
    if not chunk:raise ValueError('Lectura incompleta')
    h.update(chunk);left-=len(chunk)
 return h.hexdigest()

def copy_range(source,target,start,end):
 source.seek(start);left=end-start
 while left:
  chunk=source.read(min(CHUNK,left))
  if not chunk:raise ValueError('Lectura incompleta')
  target.write(chunk);left-=len(chunk)

def asset_count(path):
 marker=b'id="asset-';count=0;carry=b''
 with path.open('rb') as f:
  while chunk:=f.read(CHUNK):
   data=carry+chunk;limit=max(0,len(data)-len(marker)+1)
   count+=sum(1 for m in re.finditer(marker,data) if m.start()<limit)
   carry=data[limit:]
 return count+carry.count(marker)

def build(source,output):
 start,end,original=locate(source);a=original.index('function packKeys45(');b=original.index('const boot45=',a)
 helpers=(ROOT/'performance'/f'{BLOCK}.js').read_text()
 app=original[:a]+helpers+'\n'+original[b:]
 needles=[
  ('for(const model of raw){const clips={};','const sharedKeys38=new Map();for(const model of raw){const clips={};'),
  ('packKeys45(values[kind],kind);tracks.push','packKeys45(values[kind],kind,sharedKeys38);tracks.push'),
  ('const baked=raw.map(pack=>','const sharedKeys43=new Map();const baked=raw.map(pack=>'),
  ('packKeys45(values[kind],kind));return map;','packKeys45(values[kind],kind,sharedKeys43));return map;'),
 ]
 for old,new in needles:
  if app.count(old)!=1:raise ValueError('La base cambió: '+old)
  app=app.replace(old,new,1)
 a=app.index('async function streamPass44(');b=app.index('function houseBytes44(',a)
 app=app[:a]+(ROOT/'performance'/'streaming-plan.js').read_text()+'\n'+app[b:]
 a=app.index('function packKeys45(');b=app.index('function samplePacked45(',a)
 app=app[:a]+(ROOT/'performance'/'exact-animation-storage.js').read_text()+'\n'+app[b:]
 a=app.index('async function createTemplates(){');b=app.index('let contactSource=',a)
 app=app[:a]+(ROOT/'performance'/'vehicle-template-loading.js').read_text()+'\n'+app[b:]
 app=app.replace('const boot45=',(ROOT/'performance'/'static-geometry-sharing.js').read_text()+'\nconst boot45=',1)
 old='await createTemplates();await installFleet();'
 if app.count(old)!=1:raise ValueError('Cambió el final de la preparación')
 app=app.replace(old,'await createTemplates();technical44.geometrySharing05=await shareStaticGeometry05(scene,loadYield25,[...new Set(Object.values(templates).flatMap(t=>t.root.getChildMeshes().map(m=>m.geometry)).filter(Boolean))]);await installFleet();',1)
 a=app.index('function gardens46(){');b=app.index('// GPU vertices',a)
 app=app[:a]+(ROOT/'performance'/'progressive-gardens.js').read_text()+'\n'+app[b:]
 app=app.replace('const boot45=',(ROOT/'performance'/'spatial-residents.js').read_text()+'\nconst boot45=',1)
 app=app.replace('const boot45=',(ROOT/'performance'/'moving-details.js').read_text()+'\nconst boot45=',1)
 old='await install46();installIdentity42();'
 if app.count(old)!=1:raise ValueError('Cambió la preparación de detalles móviles')
 app=app.replace(old,'await install46();technical44.movingDetails07=movingDetails07(fleet);installIdentity42();',1)
 app=app.replace('const boot45=',(ROOT/'performance'/'static-point-cache.js').read_text()+'\nconst boot45=',1)
 old='const mesh=new B.Mesh(name,scene),vd=new B.VertexData();'
 if app.count(old)!=1:raise ValueError('Cambió el constructor de mallas')
 app=app.replace(old,'const mesh=new B.Mesh(name,scene);mesh.isPickable=false;mesh.refreshBoundingInfo=nonPickingBounds08;const vd=new B.VertexData();',1)
 old='await install46();technical44.movingDetails07='
 if app.count(old)!=1:raise ValueError('Cambió el cierre de preparación')
 app=app.replace(old,'await install46();technical44.pointCache08=staticPointCache08(scene);technical44.movingDetails07=',1)
 app=app.replace('const boot45=',(ROOT/'performance'/'vehicle-body-batching.js').read_text()+'\nconst boot45=',1)
 old='await createTemplates();technical44.geometrySharing05='
 if app.count(old)!=1:raise ValueError('Cambió la preparación de plantillas')
 app=app.replace(old,'await createTemplates();technical44.vehicleBatching11=await batchVehicleBodies11(B,templates,loadYield25);technical44.geometrySharing05=',1)
 a=app.index('function updateFleet(dt){');b=app.index('function tick(dt){',a)
 app=app[:a]+(ROOT/'performance'/'stationary-vehicle-transforms.js').read_text()+'\n'+app[b:]
 app=app.replace('const boot45=',(ROOT/'performance'/'active-mesh-candidates.js').read_text()+'\nconst boot45=',1)
 app=app.replace('const boot45=',(ROOT/'performance'/'runtime-diagnostics.js').read_text()+'\nconst boot45=',1)
 old='engine.runRenderLoop(()=>{try{const now=performance.now(),dt='
 if app.count(old)!=1:raise ValueError('Cambió el bucle principal')
 setup="""technical44.activeCandidates12=installActiveCandidates12(scene);
 const diagnostics09=installRuntimeDiagnostics09(B,scene,engine,()=>({userAgent:navigator.userAgent,quality,playing,driving,position:{x:(driving?current:player).root.position.x,z:(driving?current:player).root.position.z},width:engine.getRenderWidth(),height:engine.getRenderHeight(),hardwareScaling:engine.getHardwareScalingLevel(),meshes:scene.meshes.length,activeMeshes:scene.getActiveMeshes().length,materials:scene.materials.length,zones:zones.size,heapBytes:performance.memory?.usedJSHeapSize??null,webGL:engine.webGLVersion,renderer:engine.getGlInfo?.().renderer??null}),stage39.sceneInstrument,()=>stage39.instrument);
 tick=diagnostics09.wrap('simulation',tick);updatePeople25=diagnostics09.wrap('pedestrians',updatePeople25);updateFleet=diagnostics09.wrap('vehicles',updateFleet);follow=diagnostics09.wrap('camera',follow);walkPose=diagnostics09.wrap('heroPose',walkPose);sampleHuman=diagnostics09.wrap('animationSampling',sampleHuman);plantFeet43=diagnostics09.wrap('footIK',plantFeet43);updateShadowList=diagnostics09.wrap('shadowList',updateShadowList);updateHouseDetails=diagnostics09.wrap('houses',updateHouseDetails);scene.render=diagnostics09.wrap('sceneRenderCPU',scene.render);
 Object.defineProperty(window.Nicaragua,'diagnostics09',{value:diagnostics09});
 const diagPanel09=document.createElement('div');diagPanel09.className='setting';const diagTitle09=document.createElement('b');diagTitle09.textContent='Diagnóstico de rendimiento';const record09=document.createElement('button');record09.textContent='Medir 15 segundos';record09.onclick=()=>{if(!homeMode)pause(false);diagnostics09.start(15);toast('Medición iniciada. Jugá durante 15 segundos y después descargá el informe.');};const export09=document.createElement('button');export09.textContent='Descargar informe';export09.onclick=()=>{if(!diagnostics09.download())toast('Primero iniciá una medición.');};diagPanel09.append(diagTitle09,document.createElement('br'),record09,export09);($('optionsPanel')||$('settings').querySelector('.sheet')).append(diagPanel09);
 """
 app=app.replace(old,setup+'\nengine.runRenderLoop(()=>{try{const now=performance.now();diagnostics09.frame(now);const dt=',1)
 from build_handling import apply as apply_handling
 app=apply_handling(app)
 if '</script>' in app:raise ValueError('Código no integrable')
 code=app.encode('utf-8');output.parent.mkdir(parents=True,exist_ok=True);tmp=output.with_suffix('.tmp')
 try:
  with source.open('rb') as f,tmp.open('wb') as target:
   copy_range(f,target,0,start);target.write(code);copy_range(f,target,end,source.stat().st_size)
  old_hash=digest(source,[(0,start),(end,source.stat().st_size)])
  new_hash=digest(tmp,[(0,start),(start+len(code),tmp.stat().st_size)])
  if old_hash!=new_hash:raise ValueError('Cambió contenido fuera de appSource')
  tmp.replace(output)
 finally:
  tmp.unlink(missing_ok=True)
 report={'blocks':[BLOCK,'streaming-plan','exact-animation-storage','vehicle-template-loading','static-geometry-sharing','progressive-gardens','moving-details','static-point-cache','runtime-diagnostics','stationary-vehicle-transforms','vehicle-body-batching','active-mesh-candidates','vehicle-handling'],'baseSha256':digest(source),'outputSha256':digest(output),'bytes':output.stat().st_size,'allOutsideAppSourceIdentical':True,'changedFunctions':['packKeys45','samplePacked45','streamPass44','createTemplates','gardens46','meshData','updateFleet'],'assetBlocks':asset_count(output)}
 (output.parent/'build-verification.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--source',type=Path,default=ROOT/'Managua_Del_taller_al_lago(1).html');p.add_argument('--output',type=Path,default=ROOT/'dist'/'Managua.html');a=p.parse_args();build(a.source,a.output)
