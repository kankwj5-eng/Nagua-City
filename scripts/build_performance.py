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
 report={'block':BLOCK,'baseSha256':digest(source),'outputSha256':digest(output),'bytes':output.stat().st_size,'allOutsideAppSourceIdentical':True,'changedFunctions':['packKeys45','samplePacked45'],'assetBlocks':asset_count(output)}
 (output.parent/'build-verification.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--source',type=Path,default=ROOT/'Managua_Del_taller_al_lago(1).html');p.add_argument('--output',type=Path,default=ROOT/'dist'/'Managua.html');a=p.parse_args();build(a.source,a.output)
