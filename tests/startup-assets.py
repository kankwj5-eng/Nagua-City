"""Verify lossless catalog splitting against the official, embedded game assets."""
from pathlib import Path
import mmap,re,json,gzip,base64,hashlib
root=Path(__file__).resolve().parents[1]
with (root/'Managua_Del_taller_al_lago(1).html').open('rb') as a,(root/'dist/Managua.html').open('rb') as b:
 with mmap.mmap(a.fileno(),0,access=mmap.ACCESS_READ) as old,mmap.mmap(b.fileno(),0,access=mmap.ACCESS_READ) as new:
  def get(data,id):
   pattern=rb'<script[^>]*id="'+re.escape(id.encode())+rb'"[^>]*>(.*?)</script>'
   m=re.search(pattern,data,re.S)
   assert m,id
   return m[1]
  summaries=[]
  for name in ['world','extensions']:
   original=json.loads(gzip.decompress(base64.b64decode(get(old,'asset-'+name))))
   reconstructed=json.loads(get(new,'catalog48-'+name))
   for z in reconstructed['zones']:z['data']=get(new,z.pop('asset48')).decode()
   for i,im in enumerate(reconstructed['images']):
    if name=='world':reconstructed['images'][i]=get(new,im['asset48']).decode()
    else:im['data']=get(new,im.pop('asset48')).decode()
   assert reconstructed==original,name+' changed content'
   summaries.append({'catalog':name,'zonesExact':len(original['zones']),'imagesExact':len(original['images'])})
  def revive(v):
   if isinstance(v,dict):
    if 'resource48' in v:return get(new,v['resource48']).decode()
    return {k:revive(x) for k,x in v.items()}
   if isinstance(v,list):return [revive(x) for x in v]
   return v
  for name in ['humans','surfaces','surfaces34','materials42']:
   original=json.loads(gzip.decompress(base64.b64decode(get(old,'asset-'+name))))
   reconstructed=revive(json.loads(get(new,'pack48-'+name)))
   assert original==reconstructed,name+' changed content'
   summaries.append({'pack':name,'decodedContentExact':True})
  ids=re.findall(rb'id="(asset-[^"]+)"',old)
  for id in ids:
   if id in [b'asset-world',b'asset-extensions',b'asset-humans',b'asset-surfaces',b'asset-surfaces34',b'asset-materials42']:continue
   assert get(old,id.decode())==get(new,id.decode()),id
report={'passed':True,'catalogs':summaries,'otherAssetBlocksExact':len(ids)-6}
(root/'dist/startup-assets.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
