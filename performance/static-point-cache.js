// Block 08: drawing and bounding boxes do not need per-mesh Vector3 picking copies.
// This targets the embedded Babylon 9.29 cache; keep deformable or pickable meshes intact.
function staticPointCache08(scene){
 const pending=new Set(),stats={clearedMeshes:0,clearedPoints:0,skippedDifferentPositions:0};
 function release(m){
  if(m.isDisposed()||m.isPickable||m.skeleton||m.morphTargetManager||m.bakedVertexAnimationManager)return;
  const info=m._internalAbstractMeshDataInfo,points=info?._positions;if(!points?.length)return;
  const positions=m.getVerticesData('position');if(!positions||positions.length!==points.length*3)return;
  // Release only a duplicate of the undeformed vertex data, never a CPU-deformed result.
  for(let i=0;i<points.length;i++){const p=points[i],k=i*3;if(p.x!==positions[k]||p.y!==positions[k+1]||p.z!==positions[k+2]){stats.skippedDifferentPositions++;return;}}
  stats.clearedMeshes++;stats.clearedPoints+=points.length;info._positions=null;
 }
 for(const mesh of scene.meshes)release(mesh);
 const added=scene.onNewMeshAddedObservable.add(mesh=>pending.add(mesh));
 const before=scene.onBeforeRenderObservable.add(()=>{for(const mesh of pending)release(mesh);pending.clear();});
 scene.onDisposeObservable.addOnce(()=>{pending.clear();scene.onNewMeshAddedObservable.remove(added);scene.onBeforeRenderObservable.remove(before);});
 return stats;
}

// Share this function on game-created meshes; do not alter Babylon's global prototype.
function nonPickingBounds08(applySkeleton=false,applyMorph=false){
 const options=typeof applySkeleton==='object'?{...applySkeleton}:{applySkeleton,applyMorph};
 if(!this.isPickable&&!options.applySkeleton&&!options.applyMorph&&!options.applyBakedVertexAnimation&&options.updatePositionsArray===undefined)options.updatePositionsArray=false;
 return B.Mesh.prototype.refreshBoundingInfo.call(this,options);
}
