// Restore the original packed object, fetching only the resources of this pack.
// Four concurrent fetches bound the startup network and memory pressure on Android.
async function packed48(name){
 const packed=JSON.parse(embedded48('pack48-'+name));
 const refs=new Set();
 const collect=value=>{
  if(!value||typeof value!=='object')return;
  if(value.resource48){refs.add(value.resource48);return;}
  if(Array.isArray(value)){for(const item of value)collect(item);return;}
  for(const item of Object.values(value))collect(item);
 };
 collect(packed);
 const resolved=new Map(),queue=[...refs];
 for(let i=0;i<queue.length;i+=4){
  await Promise.all(queue.slice(i,i+4).map(async id=>{const el=document.getElementById(id);resolved.set(id,el?.dataset.format==='image'?el.dataset.src:await embeddedRemote48(id));}));
  if(i+4<queue.length)await loadYield25();
 }
 const revive=value=>{
  if(!value||typeof value!=='object')return value;
  if(value.resource48)return resolved.get(value.resource48);
  if(Array.isArray(value))return value.map(revive);
  return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,revive(v)]));
 };
 return revive(packed);
}
