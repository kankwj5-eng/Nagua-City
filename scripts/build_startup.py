"""Split nested compressed catalogs so opening a street never inflates the city."""
import base64,gzip,json,re,hashlib

def apply(app):
 def replace(old,new):
  nonlocal app
  if app.count(old)!=1:raise ValueError('Startup patch drift: '+old[:100])
  app=app.replace(old,new,1)
 helpers='''
// Catalog payloads remain embedded for content:// and offline use. Only selected
// zones are decompressed. Images are handed to Babylon when a material is visible.
const startup48={began:performance.now(),firstPlayableMs:null,zoneReads:[],textureErrors:[],catalogBytes:0,automaticEntry:true};
function embedded48(id){const el=document.getElementById(id);if(!el)throw Error('Falta recurso '+id);return el.textContent.trim();}
function packed48(name){const revive=value=>{if(!value||typeof value!=='object')return value;if(value.resource48)return embedded48(value.resource48);if(Array.isArray(value))return value.map(revive);return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,revive(v)]));};return revive(JSON.parse(embedded48('pack48-'+name)));}
function catalog48(name){const text=embedded48('catalog48-'+name);startup48.catalogBytes+=text.length;const raw=JSON.parse(text);raw.images=raw.images.map((image,i)=>name==='world'?embedded48(image.asset48):{...image,data:embedded48(image.asset48)});delete INTEGRATED[name];document.getElementById('asset-'+name)?.remove();return raw;}
'''
 replace('const boot45=',helpers+'\nconst boot45=')
 replace('async function loadAsset(name){','async function loadAsset(name){if((name===\'world\'||name===\'extensions\')&&document.getElementById(\'catalog48-\'+name))return catalog48(name);')
 replace("JSON.parse(new TextDecoder().decode(await inflate(bytes(INTEGRATED.humans))))","packed48('humans')")
 replace("JSON.parse(new TextDecoder().decode(await inflate(bytes(INTEGRATED.surfaces))))","packed48('surfaces')")
 replace("const packed=JSON.parse(new TextDecoder().decode(await inflate(bytes(node.textContent))));","const packed=packed48('surfaces34');")
 replace("const el=$('asset-materials42'),raw=JSON.parse(new TextDecoder().decode(await inflate(bytes(el.textContent))));","const el=$('asset-materials42'),raw=packed48('materials42');")
 # No global delayed-texture flag: glTF/cube texture loaders must retain their
 # ordinary completion callbacks. Only our material textures are lazy.
 a=app.index('async function loadTexture(src,invert=false){');b=app.index('async function materials(){',a)
 app=app[:a]+'''async function loadTexture(src,invert=false){
 const previous=scene.useDelayedTextureLoading;let t;
 try{scene.useDelayedTextureLoading=true;t=new B.Texture(src,scene,false,invert,B.Texture.TRILINEAR_SAMPLINGMODE,undefined,(_,e)=>{startup48.textureErrors.push(String(e?.message||e||'Textura inválida'));});}
 finally{scene.useDelayedTextureLoading=previous;}
 t.gammaSpace=true;t.wrapU=t.wrapV=B.Texture.WRAP_ADDRESSMODE;t.anisotropicFilteringLevel=8;return t;
}
'''+app[b:]
 replace('const buffer=await inflate(bytes(z.data));','const encoded=z.asset48?embedded48(z.asset48):z.data;startup48.zoneReads.push(key);const buffer=await inflate(bytes(encoded));')
 replace("$('quality').value='high';stage35.settings.mode='fixed';$('adaptive35').value='fixed';", "$('quality').value=matchMedia('(pointer:coarse)').matches?'medium':'high';stage35.settings.mode='auto';$('adaptive35').value='auto';")
 replace("stage35.settings.mode='fixed';$('adaptive35').value='fixed';resetBudget35();","stage35.settings.mode='auto';$('adaptive35').value='auto';resetBudget35();")
 # First pass is genuinely small; ordinary streaming already runs every .45 s.
 replace("const lim=quality==='low'?{r:125,max:12}:quality==='high'?{r:205,max:26}:{r:160,max:18};", "const initial48=!boot45.inspect().done;const lim=initial48?{r:100,max:3}:quality==='low'?{r:125,max:12}:quality==='high'?{r:205,max:26}:{r:160,max:18};")
 replace("const budget=force?(quality==='low'?6:8):2;let loaded=0;\n  for(const o of near)", "const budget=initial48?3:force?(quality==='low'?6:8):1;let loaded=0;\n  for(const o of near)")
 replace('get boot45(){return boot45.inspect();}', 'get startup48(){return {...startup48,elapsedMs:Math.round(performance.now()-startup48.began)};},get boot45(){return boot45.inspect();}')
 replace("$('start').textContent='SALIR AL BARRIO';boot45.finish();", "$('start').textContent='ENTRAR A LA CIUDAD';boot45.finish();startup48.firstPlayableMs=Math.round(performance.now()-startup48.began);startup48.zonesAtEntry=zones.size;startup48.zoneReadsAtEntry=startup48.zoneReads.length;setTimeout(()=>{if(homeMode&&!boot45.inspect().failed)$('start').click();},0);")
 # During a long synchronous setup let the progress UI paint between installers.
 a=app.index("try{if(!window.DecompressionStream)");b=app.index('window.Nicaragua=',a)
 boot=app[a:b]
 boot=re.sub(r'(?<!await )(?<!function )(install\w+\(\);)',r'\1await loadYield25();',boot)
 app=app[:a]+boot+app[b:]
 return app

def split_catalogs(path):
 source=path.read_bytes();reports=[]
 for name in ['world','extensions']:
  marker=re.compile(rb'(<script[^>]*id="asset-'+name.encode()+rb'"[^>]*>)(.*?)(</script>)',re.S)
  match=marker.search(source)
  if not match:raise ValueError('Missing catalog '+name)
  raw=json.loads(gzip.decompress(base64.b64decode(match[2])));blocks=[];zone_hashes=[];image_hashes=[]
  def block(id,value):
   blocks.append('<script type="application/octet-stream" id="'+id+'">'+value+'</script>')
  for i,z in enumerate(raw['zones']):
   value=z.pop('data');id='zone48-'+name+'-'+str(i);z['asset48']=id;block(id,value);zone_hashes.append(hashlib.sha256(value.encode()).hexdigest())
  for i,image in enumerate(raw['images']):
   id='image48-'+name+'-'+str(i)
   if name=='world':value=image;raw['images'][i]={'asset48':id}
   else:value=image.pop('data');image['asset48']=id
   block(id,value);image_hashes.append(hashlib.sha256(value.encode()).hexdigest())
  meta=json.dumps(raw,separators=(',',':'),ensure_ascii=False)
  if '</script>' in meta:raise ValueError('Invalid metadata')
  block('catalog48-'+name,meta)
  # Keep the legacy asset ID for bootstrap compatibility without retaining a
  # duplicate 45 MB compressed catalog. Its loader is intercepted above.
  replacement=match[1]+base64.b64encode(gzip.compress(b'{}',mtime=0))+match[3]+('\n'+'\n'.join(blocks)).encode()
  source=source[:match.start()]+replacement+source[match.end():]
  reports.append({'catalog':name,'startupMetadataBytes':len(meta.encode()),'previousBase64Bytes':len(match[2]),'zones':len(zone_hashes),'images':len(image_hashes),'zonePayloadSHA256':zone_hashes,'imagePayloadSHA256':image_hashes})
 for name in ['humans','surfaces','surfaces34','materials42']:
  marker=re.compile(rb'(<script[^>]*id="asset-'+name.encode()+rb'"[^>]*>)(.*?)(</script>)',re.S)
  match=marker.search(source)
  raw=json.loads(gzip.decompress(base64.b64decode(match[2])));blocks=[];hashes=[]
  def separate(value):
   if isinstance(value,str) and len(value)>1024:
    id='resource48-'+name+'-'+str(len(blocks))
    if '</script>' in value:raise ValueError('Invalid embedded image')
    blocks.append('<script type="application/octet-stream" id="'+id+'">'+value+'</script>')
    hashes.append(hashlib.sha256(value.encode()).hexdigest());return {'resource48':id}
   if isinstance(value,list):return [separate(v) for v in value]
   if isinstance(value,dict):return {k:separate(v) for k,v in value.items()}
   return value
  meta=json.dumps(separate(raw),separators=(',',':'),ensure_ascii=False)
  blocks.append('<script type="application/octet-stream" id="pack48-'+name+'">'+meta+'</script>')
  replacement=match[1]+base64.b64encode(gzip.compress(b'{}',mtime=0))+match[3]+('\n'+'\n'.join(blocks)).encode()
  source=source[:match.start()]+replacement+source[match.end():]
  reports.append({'pack':name,'startupMetadataBytes':len(meta.encode()),'previousBase64Bytes':len(match[2]),'resources':len(hashes),'resourcePayloadSHA256':hashes})
 path.write_bytes(source)
 return reports
