"""Replace only presentation46, preserving the self-contained game's assets."""
from pathlib import Path
import base64,json,mmap,hashlib
ROOT=Path(__file__).resolve().parents[1]
OPEN=b'<script id="presentation46">'

def range_for(path,marker):
 with path.open('rb') as f,mmap.mmap(f.fileno(),0,access=mmap.ACCESS_READ) as s:
  tag=s.find(marker)
  if tag<0:raise ValueError('Missing reviewed script '+str(marker))
  start=tag+len(marker);end=s.find(b'</script>',start)
  if end<0:raise ValueError('Unclosed reviewed script')
  return start,end

def stable_digest(path):
 ranges=sorted([range_for(path,OPEN),range_for(path,b'<script id="appSource" type="text/plain">')]);h=hashlib.sha256();pos=0
 with path.open('rb') as f:
  for start,end in ranges+[(path.stat().st_size,path.stat().st_size)]:
   f.seek(pos);left=start-pos
   while left:
    data=f.read(min(left,1024*1024));h.update(data);left-=len(data)
   pos=end
 return h.hexdigest()

def replace(path):
 from build_performance import copy_range
 start,end=range_for(path,OPEN);raw=(ROOT/'presentation/assets/managua-menu-reference.jpg').read_bytes();art='data:image/jpeg;base64,'+base64.b64encode(raw).decode()
 code=(ROOT/'presentation/menu.js').read_text().replace('__ART_DATA_URL__',json.dumps(art)).replace('__STYLE_TEXT__',json.dumps((ROOT/'presentation/menu.css').read_text()))
 if '</script>' in code:raise ValueError('Invalid presentation code')
 out=path.with_suffix('.presentation.tmp')
 try:
  with path.open('rb') as f,out.open('wb') as target:
   copy_range(f,target,0,start);target.write(code.encode());copy_range(f,target,end,path.stat().st_size)
  if stable_digest(path)!=stable_digest(out):raise ValueError('Changed content outside reviewed scripts')
  out.replace(path)
 finally:out.unlink(missing_ok=True)
 return {'artBytes':len(raw),'artImages':1,'previousPresentationBytes':end-start,'newPresentationBytes':len(code.encode()),'networkRequests':0,'artSource':'user-supplied-reference','artSHA256':hashlib.sha256(raw).hexdigest()}
