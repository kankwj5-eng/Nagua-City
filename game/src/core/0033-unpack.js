async function unpack(z,extra=false){
 if(zones.has(z.id)||pending.has(z.id))return;pending.add(z.id);
 const root=new B.TransformNode(z.id,scene),meshes=[];let slice=performance.now();
 const yieldMesh=async()=>{if(performance.now()-slice<8)return;await loadYield25();slice=performance.now();};
 try{
  if(!ready)boot45.zone(z.id);
  const ab=await zoneBuffer44(z,extra);
  if(extra){const specs=JSON.parse(new TextDecoder().decode(ab));for(const s of specs){meshes.push(meshData(z.id,typed(s.p,Float32Array),decodeNormals(typed(s.n,Int8Array)),typed(s.uv,Float32Array),typed(s.i,Uint32Array),s.c?typed(s.c,Float32Array):null,extMats[s.m],root));await yieldMesh();}}
  else{const head=new DataView(ab).getUint32(0,true),spec=JSON.parse(new TextDecoder().decode(new Uint8Array(ab,4,head))),base=4+head;for(const s of spec){const mt=worldMats[s.m];if(/^(lago|agua|water)$/.test(mt.name))continue;const p=new Float32Array(ab,base+s.p,s.count*3),n=decodeNormals(new Int8Array(ab,base+s.n,s.count*3)),uv=new Float32Array(ab,base+s.uv,s.count*2),i=new Uint32Array(ab,base+s.i,s.icount);meshes.push(meshData(z.id,p,n,uv,i,null,mt,root));await yieldMesh();}}
  for(const m of meshes){m.freezeWorldMatrix();m.refreshBoundingInfo();await yieldMesh();}
  zones.set(z.id,{root,meshes,definition:z});if(!ready)boot45.zoneDone();
 }catch(e){root.dispose();throw e;}finally{pending.delete(z.id);}
}
