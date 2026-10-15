const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict'),script=require('./html-script.cjs');
const root=path.resolve(__dirname,'..'),source=process.argv[2]||path.join(root,'Managua_Del_taller_al_lago(1).html');
function cut(app,a,b){const x=app.indexOf(a),y=app.indexOf(b,x);assert(x>=0&&y>x);return app.slice(x,y);}
(async()=>{
 const app=await script(source,'appSource'),moduleB={exports:{}};new Function('module','exports',zlib.gunzipSync(Buffer.from(await script(source,'asset-babylon'),'base64')).toString())(moduleB,moduleB.exports);const B=moduleB.exports;
 const engine=new B.NullEngine(),scene=new B.Scene(engine),assets=JSON.parse(zlib.gunzipSync(Buffer.from(await script(source,'asset-vehicles'),'base64'))),mats={};for(const mat of assets.materials)mats[mat.name]=new B.StandardMaterial(mat.name,scene);
 const ctx={B,scene,vehicleAssets:assets,assetMats:mats,templates:{},lowTemplates:{},simulation25:{load:{models:0}},performance,loadYield25:async()=>{},status(){},pbr:name=>new B.StandardMaterial(name,scene),typed:(s,T)=>new T(Uint8Array.from(Buffer.from(s,'base64')).buffer),replaceCanopies32:(p,i)=>i,btoa};
 const names=Object.keys(ctx),create=new Function(...names,cut(app,'function meshData(','async function unpack(')+cut(app,'function expandVehicleVariants(){','function labelTaxi(')+fs.readFileSync(path.join(root,'performance/vehicle-template-loading.js'),'utf8')+';return createTemplates;')(...Object.values(ctx));await create();
 const helper=fs.readFileSync(path.join(root,'performance/vehicle-body-batching.js'),'utf8'),batch=new Function(helper+';return batchVehicleBodies11;')();
 function snapshot(){const records=[];for(const [name,t] of Object.entries(ctx.templates))for(const [part,parent] of Object.entries(t.parts)){
  const groups=new Map();for(const m of parent.getChildMeshes(true)){const key=m.name+'|'+(m.material?.name||'none'),hashes=groups.get(key)||[];for(const index of m.getIndices()){const h=crypto.createHash('sha256');for(const kind of m.getVerticesDataKinds().slice().sort()){const data=m.getVerticesData(kind),size=m.getVertexBuffer(kind).getSize();h.update(kind);h.update(Buffer.from(data.buffer,data.byteOffset+index*size*4,size*4));}hashes.push(h.digest('hex'));}groups.set(key,hashes);}
  for(const [key,vertices] of groups)records.push([name,part,key,vertices]);
 }return records.sort((a,b)=>JSON.stringify(a.slice(0,3)).localeCompare(JSON.stringify(b.slice(0,3))));}
 function movingParts(){return Object.fromEntries(Object.entries(ctx.templates).map(([name,t])=>[name,Object.entries(t.parts).filter(([p])=>p!=='body'||['pulsar','boxer','discover','trail','delivery','yamaha','taypan','urban125','enduro','bicycle'].includes(name)).map(([p,r])=>[p,r.getChildMeshes().map(m=>m.uniqueId)])]));}
 const before=snapshot(),parts=movingParts(),glass=Object.values(ctx.templates).flatMap(t=>t.root.getChildMeshes()).filter(m=>/glass/i.test(m.material?.name)).map(m=>m.uniqueId);
 const stats=await batch(B,ctx.templates,async()=>{});assert(stats.removedMeshes>100);assert.deepEqual(snapshot(),before);assert.deepEqual(movingParts(),parts);assert.deepEqual(Object.values(ctx.templates).flatMap(t=>t.root.getChildMeshes()).filter(m=>/glass/i.test(m.material?.name)).map(m=>m.uniqueId),glass);
 // Repainters match the same name tokens after cloning a template. No material disposal.
 for(const t of Object.values(ctx.templates))for(const m of t.root.getChildMeshes())assert(!m.material?.isDisposed?.());
 const second=await batch(B,ctx.templates,async()=>{});assert.equal(second.removedMeshes,0);
 const delivered=await script(path.join(root,'dist/Managua.html'),'appSource');assert(delivered.includes('vehicleBatching11=await batchVehicleBodies11(B,templates,loadYield25)'));
 const report={block:11,engine:B.Engine.Version,scope:'real automobile-template geometry; potential draws per detailed vehicle, not Android FPS',...stats,exactIndexedVertexChannels:true,motorcycleAndMovingPartObjectsPreserved:true,glassObjectsPreserved:true,idempotent:true,passed:true};fs.writeFileSync(path.join(root,'dist/performance-block11.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));engine.dispose();
})().catch(e=>{console.error(e);process.exitCode=1});
