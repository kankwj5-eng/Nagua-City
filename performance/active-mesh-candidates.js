// Block 12: preserve the caller's broad phase; skip only nodes the renderer rejects anyway.
function installActiveCandidates12(scene){
 const original=scene.getActiveMeshCandidates,candidates={data:[],length:0},stats={passes:0,visited:0,returned:0};
 function filtered(){
  const source=original.call(scene),data=candidates.data;let count=0;stats.passes++;stats.visited+=source.length;
  for(let i=0;i<source.length;i++){
   const mesh=source.data[i];
   // Do not suppress readiness work for explicitly delayed-loading resources.
   if(mesh.isBlocked||!mesh.isEnabled()&&!mesh.delayLoadState)continue;
   data[count++]=mesh;
  }
  data.length=count;candidates.length=count;stats.returned+=count;return candidates;
 }
 scene.getActiveMeshCandidates=filtered;
 scene.onDisposeObservable.addOnce(()=>{if(scene.getActiveMeshCandidates===filtered)scene.getActiveMeshCandidates=original;candidates.data.length=0;candidates.length=0;});
 return stats;
}
