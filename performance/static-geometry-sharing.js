// Block 05: intern immutable geometry by exact buffer bytes, never by shape alone.
async function shareStaticGeometry05(scene,wait,geometries=scene.geometries){
 const stats={examined:0,shared:0,meshes:0,duplicateBufferBytes:0,skipped:0};
 const pool=new Map();let slice=performance.now();
 function describe(g){
  // The index mutability flag belongs to the embedded Babylon 9.29 engine.
  if(!g.isReady()||g._indexBufferIsUpdatable)return null;
  if(g.meshes.some(m=>m.skeleton||m.morphTargetManager||m.animations?.length||/Antebrazo|Brazo y manga/.test(m.name)||m._creationDataStorage||m.subMeshes?.length!==1||m.subMeshes[0].materialIndex!==0))return null;
  const arrays=[],layout=[];
  for(const kind of g.getVerticesDataKinds().slice().sort()){
   const vb=g.getVertexBuffer(kind),data=vb?.getData();
   if(!vb||vb.isUpdatable()||!ArrayBuffer.isView(data)||data instanceof DataView||vb.getIsInstanced())return null;
   layout.push([kind,data.constructor.name,vb.type,vb.normalized,vb.byteStride,vb.byteOffset,vb.getSize()]);
   arrays.push(new Uint8Array(data.buffer,data.byteOffset,data.byteLength));
  }
  const indices=g.getIndices();
  if(!ArrayBuffer.isView(indices)||indices instanceof DataView)return null;
  layout.push(['indices',indices.constructor.name,indices.length,g.boundingBias?.x||0,g.boundingBias?.y||0]);
  arrays.push(new Uint8Array(indices.buffer,indices.byteOffset,indices.byteLength));
  let hash=2166136261,bytes=0;
  for(const a of arrays){bytes+=a.byteLength;for(let i=0;i<a.length;i++)hash=Math.imul(hash^a[i],16777619)>>>0;}
  return {g,arrays,bytes,key:JSON.stringify(layout)+'|'+hash};
 }
 function equal(a,b){
  if(a.arrays.length!==b.arrays.length)return false;
  for(let k=0;k<a.arrays.length;k++){const x=a.arrays[k],y=b.arrays[k];if(x.length!==y.length)return false;for(let i=0;i<x.length;i++)if(x[i]!==y[i])return false;}
  return true;
 }
 for(const g of geometries.slice()){
  stats.examined++;const candidate=describe(g);
  if(!candidate){stats.skipped++;continue;}
  const bucket=pool.get(candidate.key)||[],match=bucket.find(old=>equal(old,candidate));
  if(match){
   const meshes=g.meshes.slice();for(const mesh of meshes)match.g.applyToMesh(mesh);
   if(g.meshes.length===0)g.dispose();
   stats.shared++;stats.meshes+=meshes.length;stats.duplicateBufferBytes+=candidate.bytes;
  }else{bucket.push(candidate);pool.set(candidate.key,bucket);}
  if(performance.now()-slice>=8){await wait();slice=performance.now();}
 }
 // Do not retain a second cache of the buffers or disposed geometry after startup.
 pool.clear();return stats;
}
