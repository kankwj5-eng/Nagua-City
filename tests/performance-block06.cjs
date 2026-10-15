const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),crypto=require('node:crypto'),script=require('./html-script.cjs');
const root=path.resolve(__dirname,'..'),source=process.argv[2]||path.join(root,'Managua_Del_taller_al_lago(1).html');
(async()=>{
 const app=await script(source,'appSource'),moduleB={exports:{}};new Function('module','exports',zlib.gunzipSync(Buffer.from(await script(source,'asset-babylon'),'base64')).toString())(moduleB,moduleB.exports);const B=moduleB.exports,engine=new B.NullEngine();B.Logger.Warn=()=>{};
 const start=app.indexOf('function gardens46(){'),end=app.indexOf('// GPU vertices',start),baseline=app.slice(start,end),helper=fs.readFileSync(path.join(root,'performance/spatial-residents.js'),'utf8'),next=fs.readFileSync(path.join(root,'performance/progressive-gardens.js'),'utf8');
 function make(code){
  const scene=new B.Scene(engine),V=(x=0,y=0,z=0)=>new B.Vector3(x,y,z),palm=new B.TransformNode('Fuente palma42',scene),leaf=B.MeshBuilder.CreateBox('palm leaf',{},scene);leaf.parent=palm;leaf.material=new B.PBRMaterial('palm',scene);palm.setEnabled(false);
  const ctx={B,scene,V,performance,art46:{gardenRoots:[],vegetation:0,leafTexture:null},stage42:{sources:[palm],textures:{concrete_pavement:{normal:{level:0}}},settings:{vegetation:true}},player:{root:{position:V(-18,0,94)}},current:{root:{position:V(-18,0,94)}},homeMode:true,homeGarage:false,driving:false,quality:'medium',time:0,boxes:[],data:{buildings:Array.from({length:500},(_,i)=>({x:-300+i%25*25,y:-220+Math.floor(i/25)*25,w:8,d:10,type:'casa'}))},assetMats:{},pbr:(name,color,r)=>{const m=new B.PBRMaterial(name,scene);m.roughness=r;return m;},surface42(){},LeafWind36:class{},inWorld:(x,z)=>Math.abs(x)<450&&Math.abs(z)<550,blocked:()=>false,groundAt:()=>0,addWorldBox(...args){ctx.boxes.push(args);}};
  ctx.shape46=(kind,opts,mat,pos,scale)=>{const m=B.MeshBuilder[kind]('detalle46',opts,scene);m.material=mat;m.position.copyFrom(pos);if(scale)m.scaling.copyFrom(scale);return m;};
  ctx.meshData=(name,p,n,u,i,c,mat,parent)=>{const m=new B.Mesh(name,scene),v=new B.VertexData();Object.assign(v,{positions:p,normals:n,uvs:u,indices:i});v.applyToMesh(m);m.material=mat;m.parent=parent;return m;};
  ctx.merge46=new Function('B','scene',app.slice(app.indexOf('function merge46('),app.indexOf('function shape46('))+';return merge46;')(B,scene);
  const vm=require('node:vm');vm.createContext(ctx);vm.runInContext(helper+code+';gardens46();',ctx);return ctx;
 }
 const old=make(baseline),fresh=make(next);assert.deepEqual(fresh.boxes,old.boxes);assert.equal(fresh.art46.vegetation,old.art46.vegetation);assert(fresh.art46.gardenRoots.length<old.art46.gardenRoots.length);
 const geometryHashes=new WeakMap();
 function signature(r){r.computeWorldMatrix(true);const h=crypto.createHash('sha256');h.update(JSON.stringify(Array.from(r.getWorldMatrix().m)));for(const m of r.getChildMeshes()){h.update(m.material.name);const g=m.geometry;if(!geometryHashes.has(g)){const gh=crypto.createHash('sha256');for(const k of g.getVerticesDataKinds().slice().sort())gh.update(JSON.stringify(Array.from(g.getVerticesData(k))));gh.update(JSON.stringify(Array.from(g.getIndices())));geometryHashes.set(g,gh.digest('hex'));}h.update(geometryHashes.get(g));}return h.digest('hex');}
 const authored=new Map(old.art46.gardenRoots.map(r=>[r.name,signature(r)])),initial=fresh.art46.gardenRoots.length;let comparisons=0,peakMeshes=0;
 const pathPoints=[[-18,94],[-185,-111],[185,185],[-300,-200],[300,200],[-18,94]];
 for(let cycle=0;cycle<8;cycle++)for(const quality of ['low','medium','high'])for(const [x,z] of pathPoints){
  for(const ctx of [old,fresh]){ctx.quality=quality;ctx.homeMode=false;ctx.player.root.position.set(x,0,z);ctx.time+=.8;ctx.scene.onBeforeRenderObservable.notifyObservers(ctx.scene);}
  const a=old.art46.gardenRoots.filter(r=>r.isEnabled()).map(r=>r.name).sort(),b=fresh.art46.gardenRoots.filter(r=>r.isEnabled()).map(r=>r.name).sort();assert.deepEqual(b,a);
  for(const r of fresh.art46.gardenRoots){assert.equal(signature(r),authored.get(r.name));comparisons++;}
  peakMeshes=Math.max(peakMeshes,fresh.scene.meshes.length);assert(fresh.art46.gardenRoots.length<=245);assert(fresh.scene.transformNodes.length<=250);
 }
 for(const ctx of [old,fresh]){ctx.stage42.settings.vegetation=false;ctx.time+=.8;ctx.scene.onBeforeRenderObservable.notifyObservers(ctx.scene);assert.equal(ctx.art46.gardenRoots.filter(r=>r.isEnabled()).length,0);}
 let elapsed=0,constructed=0,disposed=0;const schedule=new Function(helper+';return spatialResidents06;')()(Array.from({length:9},(_,id)=>({id,x:10+id,z:0})),o=>{constructed++;elapsed+=10;return {id:o.id};},()=>disposed++,()=>{},()=>elapsed);
 schedule.plan({x:0,z:0},1);schedule.warm();assert.equal(constructed,1);assert.equal(schedule.pending,8);schedule.warm();assert.equal(constructed,2);schedule.plan({x:2000,z:2000},1,false);assert.equal(schedule.residents,0);assert.equal(schedule.pending,0);assert.equal(disposed,2);
 const report={block:6,scope:'real embedded Babylon / deterministic garden fixture, not physical Android RAM',totalPlacements:old.art46.vegetation,initialResidents:initial,avoidedInitialResidents:old.art46.vegetation-initial,visits:8*3*pathPoints.length,rootSnapshotsCompared:comparisons,peakMeshes,streaming:{...fresh.art46.gardenStreaming06},collisionPlacementsIdentical:true,visibleGardensIdentical:true,geometryAndTransformsIdentical:true,boundedResidents:true,warmBudgetAndCancellation:true,passed:true};fs.writeFileSync(path.join(root,'dist/performance-block06.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));engine.dispose();
})().catch(e=>{console.error(e);process.exitCode=1});
