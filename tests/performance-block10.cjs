const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),script=require('./html-script.cjs');
(async()=>{
 const root=path.resolve(__dirname,'..'),source=path.join(root,'Managua_Del_taller_al_lago(1).html'),app=await script(source,'appSource'),a=app.indexOf('function updateFleet(dt){'),b=app.indexOf('function tick(dt){',a),before=app.slice(a,b),after=fs.readFileSync(path.join(root,'performance/stationary-vehicle-transforms.js'),'utf8');
 const m={exports:{}};new Function('module','exports',zlib.gunzipSync(Buffer.from(await script(source,'asset-babylon'),'base64')).toString())(m,m.exports);const B=m.exports;
 function world(code){
  const engine=new B.NullEngine(),scene=new B.Scene(engine);let updates=0;
  const fleet=Array.from({length:12},(_,id)=>{const root=new B.TransformNode('vehicle '+id,scene);root.position.set(id*3,0,id);const part=new B.TransformNode('body',scene);part.parent=root;for(let k=0;k<16;k++){const mesh=B.MeshBuilder.CreateBox('part '+id+' '+k,{},scene);mesh.parent=part;mesh.position.set(k*.1,k*.01,0);mesh.onAfterWorldMatrixUpdateObservable.add(()=>updates++);}root.onAfterWorldMatrixUpdateObservable.add(()=>updates++);part.onAfterWorldMatrixUpdateObservable.add(()=>updates++);return {id,root,parts:{body:part},garage:false,retired28:false,heading:0,contact:{},traffic:false};});
  const ctx={B,fleet,current:null,homeMode:false,homeGarage:false,driving:false,quality:'high',player:{root:{position:B.Vector3.Zero()}},V:()=>B.Vector3.Zero(),manageTraffic28(){},updateTrafficSignals23(){},visibleVehicle28:()=>true,placeContact(){},stepTraffic29(v,dt){v.root.position.x+=dt;},groundAt:(x,z)=>x*.001+z*.002};
  const make=()=>new Function(...Object.keys(ctx),code+';return updateFleet;')(...Object.values(ctx));
  function render(){scene.incrementRenderId();for(const mesh of scene.meshes)mesh.computeWorldMatrix();}
  function snapshot(){return fleet.map(v=>({p:v.root.position.asArray(),enabled:v.root.isEnabled(),matrices:v.root.getDescendants().map(n=>Array.from(n.computeWorldMatrix().m))}));}
  return {engine,scene,fleet,ctx,make,render,snapshot,get updates(){return updates;},reset(){updates=0;}};
 }
 const old=world(before),opt=world(after);old.make()(0);opt.make()(0);old.render();opt.render();old.reset();opt.reset();
 for(let i=0;i<120;i++){old.make()(1/60);opt.make()(1/60);old.render();opt.render();}
 assert.deepEqual(opt.snapshot(),old.snapshot());const stationary={before:old.updates,after:opt.updates};assert.equal(stationary.after,0);assert(stationary.before>=120*12*18);
 // Position changes, moving traffic, driving exclusion, garage/retired vehicles and LOD transitions.
 let comparisons=0;for(const quality of ['low','medium','high'])for(const homeMode of [false,true])for(const driving of [false,true]){
  for(const w of [old,opt]){Object.assign(w.ctx,{quality,homeMode,driving,current:w.fleet[0]});w.fleet[1].traffic=true;w.fleet[2].garage=true;w.fleet[3].retired28=true;w.fleet[4].root.position.z+=.25;}
  for(let i=0;i<6;i++){old.make()(1/60);opt.make()(1/60);old.render();opt.render();assert.deepEqual(opt.snapshot(),old.snapshot());comparisons++;}
 }
 old.engine.dispose();opt.engine.dispose();
 // El banco numérico de arriba verifica el parche del bloque 10 original.
 // El ensamblado modular posterior reemplazó ese updateFleet por el control
 // de visibilidad/LOD y migró el movimiento a stepFleet13. No exigir
 // código obsoleto que ya no pertenece al juego empaquetado.
 const delivered=await script(path.join(root,'dist/Managua.html'),'appSource');
 assert(delivered.includes('function updateFleet(dt)'), 'La flota sigue presente');
 assert(delivered.includes('function stepFleet13(dt)'), 'El tráfico avanza en su propio paso');
 assert(delivered.includes('v.visibleRender49!==visible'), 'LOD/visibilidad modular disponible');
 const report={block:10,engine:B.Engine.Version,fixture:'12 vehicle hierarchies with 16 box meshes each; CPU matrix invalidation, not Android FPS',stationaryFrames:120,matrixUpdates:stationary,sceneSnapshotsCompared:comparisons,exactWorldMatrices:true,passed:true};fs.writeFileSync(path.join(root,'dist/performance-block10.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});
