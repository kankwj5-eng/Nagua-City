async function streamPass44(force){
 if(!catalog||!extensions)return;
 const p=homeMode&&!homeGarage?V(-18,0,94):homeMode?current?.root.position||spawn:driving?current.root.position:player.root.position;
 const signature=[quality,homeMode,homeGarage,driving,p.x,p.z].join('|');
 if(!force&&streamComplete44&&signature===lastStream44){technical44.stationarySkips++;return;}
 technical44.streamPasses++;streamBusy=true;
 try{
  if(!streamDefinitions25)streamDefinitions25=[...catalog.zones.map(z=>({...z,extra:false})),...extensions.zones.map(z=>({...z,extra:true}))];
  const initial48=!boot45.inspect().done;const lim=initial48?{r:100,max:3}:quality==='low'?{r:125,max:12}:quality==='high'?{r:205,max:26}:{r:160,max:18};
  // Construct records only for zones inside the existing quality radius.
  const near=[],permanent=[];
  for(const z of streamDefinitions25){if(z.permanent){permanent.push(z);continue;}const d=Math.hypot(z.x-p.x,z.z-p.z);if(d<lim.r)near.push({z,d});}
  near.sort((a,b)=>a.d-b.d);near.length=Math.min(near.length,lim.max);
  const wanted=new Set(near.map(o=>o.z.id));
  const cached=[...zones.entries()].filter(([id,z])=>!z.definition.permanent);
  // Reuse each exact distance for sorting and eviction; avoid comparator recomputation.
  for(const entry of cached)entry.push(Math.hypot(entry[1].definition.x-p.x,entry[1].definition.z-p.z));
  cached.sort((a,b)=>b[2]-a[2]);let count=cached.length;
  for(const [id,z,d] of cached)if(!wanted.has(id)&&(count>lim.max+3||d>lim.r+22)){z.root.dispose();zones.delete(id);zoneRevision44++;count--;}
  for(const z of permanent)if(!zones.has(z.id)){await unpack(z,z.extra);zoneRevision44++;await loadYield25();}
  const budget=initial48?3:force?(quality==='low'?6:8):1;let loaded=0;
  for(const o of near){if(zones.has(o.z.id))continue;await unpack(o.z,o.z.extra);zoneRevision44++;loaded++;simulation25.load.zones++;await loadYield25();if(loaded>=budget)break;}
  simulation25.load.maxZoneBatch=Math.max(simulation25.load.maxZoneBatch,loaded);simulation25.load.lastZoneBatch=loaded;simulation25.load.cacheLimit=lim.max+3+permanent.length;simulation25.load.geometryPools=shapeGeometries25.size;
  lastStream44=signature;streamComplete44=near.every(o=>zones.has(o.z.id));updateShadowList();
 }catch(e){technical44.errors.push(e.message);console.error(e);toast('Error al cargar una zona: '+e.message);if(force)throw e;}finally{streamBusy=false;}
}

