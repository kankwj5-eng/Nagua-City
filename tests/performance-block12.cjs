const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),script=require('./html-script.cjs');
(async()=>{
 const root=path.resolve(__dirname,'..'),m={exports:{}};new Function('module','exports',zlib.gunzipSync(Buffer.from(await script(path.join(root,'Managua_Del_taller_al_lago(1).html'),'asset-babylon'),'base64')).toString())(m,m.exports);const B=m.exports,install=new Function(fs.readFileSync(path.join(root,'performance/active-mesh-candidates.js'),'utf8')+';return installActiveCandidates12;')();
 function setup(opt){const engine=new B.NullEngine(),scene=new B.Scene(engine);new B.FreeCamera('camera',new B.Vector3(0,0,-10),scene);new B.HemisphericLight('light',new B.Vector3(0,1,0),scene);const parent=new B.TransformNode('parent',scene),meshes=[];
  for(let i=0;i<200;i++){const mesh=B.MeshBuilder.CreateBox('box '+i,{},scene);mesh.position.set((i%10)-5,Math.floor(i/10)*.1,0);if(i%3)mesh.setEnabled(false);if(i%7===0)mesh.parent=parent;meshes.push(mesh);}
  const source=meshes[0];for(let i=0;i<10;i++){const instance=source.createInstance('instance '+i);instance.position.x=i*.1;meshes.push(instance);}
  const lod=B.MeshBuilder.CreateSphere('lod',{},scene);source.addLODLevel(30,lod);
  const native=scene.getActiveMeshCandidates,stats=opt?install(scene):null;
  return {engine,scene,meshes,parent,native,stats};}
 const before=setup(false),after=setup(true);let compared=0;
 function snapshot(w){return {active:w.scene.getActiveMeshes().data.slice(0,w.scene.getActiveMeshes().length).map(m=>m.name),indices:w.scene.getActiveIndices(),vertices:w.scene.getActiveMeshes().data.slice(0,w.scene.getActiveMeshes().length).reduce((sum,m)=>sum+m.getTotalVertices(),0),matrices:w.scene.getActiveMeshes().data.slice(0,w.scene.getActiveMeshes().length).map(m=>Array.from(m.getWorldMatrix().m))};}
 for(let frame=0;frame<120;frame++){
  for(const w of [before,after]){if(frame%8===0)w.parent.setEnabled(frame%16===0);w.meshes[frame%w.meshes.length].setEnabled(frame%4!==0);w.meshes[2].position.x=Math.sin(frame)*4;w.scene.activeCamera.position.z=frame%20<10?-10:-40;if(frame===50){const mesh=B.MeshBuilder.CreateBox('streamed',{},w.scene);w.meshes.push(mesh);}if(frame===90)w.meshes.at(-1).dispose();w.scene.render();}
  assert.deepEqual(snapshot(after),snapshot(before));compared++;
 }
 assert(after.stats.returned<after.stats.visited);
 // Preserve an existing broad phase and delayed loading, instead of replacing it with scene.meshes.
 const fake={getActiveMeshCandidates(){return {data:[{isBlocked:false,isEnabled:()=>false,delayLoadState:4},{isBlocked:false,isEnabled:()=>false,delayLoadState:0}],length:2};},onDisposeObservable:{addOnce(fn){this.fn=fn;}}};const original=fake.getActiveMeshCandidates;install(fake);assert.equal(fake.getActiveMeshCandidates().length,1);fake.onDisposeObservable.fn();assert.equal(fake.getActiveMeshCandidates,original);
 const stats={...after.stats};after.scene.dispose();assert.equal(after.scene.getActiveMeshCandidates,after.native);before.engine.dispose();after.engine.dispose();
 const app=await script(path.join(root,'dist/Managua.html'),'appSource');assert(app.includes('technical44.activeCandidates12=installActiveCandidates12(scene)'));
 const report={block:12,engine:B.Engine.Version,scope:'embedded engine, moving camera, enable changes, instances, LOD, streaming and disposal; not Android FPS',snapshotsCompared:compared,...stats,activeSetsIndicesVerticesAndMatricesExact:true,originalBroadPhaseAndDelayedLoadingPreserved:true,passed:true};fs.writeFileSync(path.join(root,'dist/performance-block12.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});
