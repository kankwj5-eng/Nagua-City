// Block 11: batch only opaque, identically named body pieces of automobile templates.
// Wheel/steering pivots, motorcycles and transparent pieces stay separate.
async function batchVehicleBodies11(B,templates,wait){
 const stats={models:0,batches:0,removedMeshes:0,beforeMeshes:0,afterMeshes:0},bikes=new Set(['pulsar','boxer','discover','trail','delivery','yamaha','taypan','urban125','enduro','bicycle']);let slice=performance.now();
 for(const [name,template] of Object.entries(templates)){
  const all=template.root.getChildMeshes();stats.beforeMeshes+=all.length;
  if(!bikes.has(name)&&template.parts.body){
   const parent=template.parts.body,pool=new Map();
   for(const m of parent.getChildMeshes(true)){
    if(m.parent!==parent||!m.geometry||m.skeleton||m.morphTargetManager||m.instances.length||m.animations.length||m.subMeshes.length!==1||m.subMeshes[0].materialIndex!==0||m.isUnIndexed||m._creationDataStorage)continue;
    if(m.position.lengthSquared()!==0||m.rotation.lengthSquared()!==0||m.rotationQuaternion&&!m.rotationQuaternion.equals(B.Quaternion.Identity())||(m.scaling.x!==1||m.scaling.y!==1||m.scaling.z!==1))continue;
    const mat=m.material;if(!mat||/glass|Cristal/i.test(mat.name)||mat.needAlphaBlendingForMesh(m)||mat.needAlphaTesting())continue;
    const kinds=m.getVerticesDataKinds().slice().sort(),layout=[];let valid=true;
    for(const k of kinds){const vb=m.getVertexBuffer(k);if(!vb||vb.isUpdatable()||vb.getIsInstanced()||vb.byteOffset!==0||vb.byteStride!==vb.getSize()*4||!(vb.getData() instanceof Float32Array)){valid=false;break;}layout.push([k,vb.getSize()]);}
    if(!valid||m.geometry._indexBufferIsUpdatable||!m.getIndices())continue;
    const key=JSON.stringify([m.name,mat.uniqueId,layout,m.isEnabled(false),m.isVisible,m.visibility,m.receiveShadows,m.isPickable,m.layerMask,m.renderingGroupId,m.overrideMaterialSideOrientation,m.hasVertexAlpha,m.useVertexColors]);
    if(!pool.has(key))pool.set(key,[]);pool.get(key).push(m);
   }
   for(const group of pool.values()){
    if(group.length<2)continue;
    const first=group[0],merged=new B.Mesh(first.name,first.getScene());merged.parent=parent;
    for(const kind of first.getVerticesDataKinds()){
     const arrays=group.map(m=>m.getVerticesData(kind)),data=new Float32Array(arrays.reduce((s,a)=>s+a.length,0));let at=0;for(const a of arrays){data.set(a,at);at+=a.length;}merged.setVerticesData(kind,data,false,first.getVertexBuffer(kind).getSize());
    }
    const indices=new Uint32Array(group.reduce((s,m)=>s+m.getTotalIndices(),0));let at=0,base=0;
    for(const m of group){for(const index of m.getIndices())indices[at++]=base+index;base+=m.getTotalVertices();}
    merged.setIndices(indices);merged.material=first.material;merged.setEnabled(first.isEnabled(false));merged.isVisible=first.isVisible;merged.visibility=first.visibility;merged.receiveShadows=first.receiveShadows;merged.isPickable=first.isPickable;merged.layerMask=first.layerMask;merged.renderingGroupId=first.renderingGroupId;merged.overrideMaterialSideOrientation=first.overrideMaterialSideOrientation;merged.hasVertexAlpha=first.hasVertexAlpha;merged.useVertexColors=first.useVertexColors;
    for(const m of group)m.dispose(false,false);
    stats.batches++;stats.removedMeshes+=group.length-1;
    if(performance.now()-slice>=8){await wait();slice=performance.now();}
   }
   pool.clear();stats.models++;
  }
  stats.afterMeshes+=template.root.getChildMeshes().length;
 }
 return stats;
}
