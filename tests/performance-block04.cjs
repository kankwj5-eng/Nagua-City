const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict'),readScript=require('./html-script.cjs');
const root=path.resolve(__dirname,'..'),source=process.argv[2]||path.join(root,'Managua_Del_taller_al_lago(1).html'),output=process.argv[3]||path.join(root,'dist/Managua.html');
function cut(app,start,end){const a=app.indexOf(start);assert(a>=0,start);const b=app.indexOf(end,a);assert(b>a,end);return app.slice(a,b);}
async function replay(app,assets,cost,failAt=Infinity){
 let clock=0,yields=0,meshes=0,slice=0,maxSlice=0;const hash=crypto.createHash('sha256'),nodes=[],statuses=[];
 const record=x=>hash.update(JSON.stringify(x));
 class TransformNode{constructor(name){this.name=name;nodes.push(this);record(['node',name]);}setEnabled(value){record(['enabled',this.name,value]);}}
 const ctx={vehicleAssets:structuredClone(assets),scene:{},B:{TransformNode},templates:{},lowTemplates:{},assetMats:new Proxy({},{get:(o,k)=>o[k]||(o[k]={name:k})}),simulation25:{load:{models:0}},performance:{now:()=>clock},Float32Array,Uint32Array,Int8Array,Uint8Array,Object,Math,btoa,
  typed(s,T){const b=Buffer.from(s,'base64');return new T(Uint8Array.from(b).buffer);},
  decodeNormals(a){return Float32Array.from(a,n=>n/127);},
  meshData(name,p,n,u,i,c,mat,parent){if(++meshes===failAt)throw Error('fixture mesh failure');clock+=cost;slice+=cost;maxSlice=Math.max(maxSlice,slice);record(['mesh',name,mat?.name,parent?.name]);for(const a of [p,n,u,i,c])if(a){record([a.constructor.name,a.length]);hash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));}else record(null);return {name,setEnabled(v){record(['enabled',name,v]);}};},
  pbr(name,color,roughness,metallic){record(['pbr',name,color,roughness,metallic]);return {name};},
  status(...a){statuses.push(a);},async loadYield25(){yields++;slice=0;clock+=4;await Promise.resolve();}
 };
 vm.createContext(ctx);vm.runInContext(cut(app,'function expandVehicleVariants(){','function labelTaxi(')+cut(app,'async function createTemplates(){','let contactSource=')+';globalThis.run=createTemplates;',ctx);
 await ctx.run();return {meshes,nodes:nodes.length,models:ctx.simulation25.load.models,released:ctx.simulation25.load.encodedCharactersReleased,templates:Object.entries(ctx.templates).map(([name,t])=>({name,meta:t.meta,parts:Object.entries(t.parts).map(([part,node])=>({part,name:node.name,parent:node.parent.name}))})),lod:Object.keys(ctx.lowTemplates),allGroupsReleased:Object.values(ctx.vehicleAssets.models).every(m=>m.groups.length===0),statuses,digest:hash.digest('hex'),yields,simulatedMs:clock,maxSlice};
}
(async()=>{
 const before=await readScript(source,'appSource'),after=await readScript(output,'appSource');new vm.Script(after);
 const assets=JSON.parse(zlib.gunzipSync(Buffer.from(await readScript(source,'asset-vehicles'),'base64'))),report={block:4,scope:'actual vehicle assets / deterministic geometry-call replay; timings are simulated, not Android startup',scenarios:[]};
 for(const cost of [.05,.4,4,12]){
  const old=await replay(before,assets,cost),next=await replay(after,assets,cost);
  for(const key of ['meshes','nodes','models','released','templates','lod','allGroupsReleased','statuses','digest'])assert.deepEqual(next[key],old[key],key);
  assert(next.allGroupsReleased);assert(next.yields<old.yields);assert(next.maxSlice<=8+2*cost+1e-6);assert(next.yields>=next.models);
  report.scenarios.push({meshCostMs:cost,models:next.models,meshes:next.meshes,yieldsBefore:old.yields,yieldsAfter:next.yields,simulatedMsBefore:old.simulatedMs,simulatedMsAfter:next.simulatedMs,maxWorkSliceMs:next.maxSlice,geometryAndOrderIdentical:true});
 }
 for(const app of [before,after])await assert.rejects(replay(app,assets,.4,17),/fixture mesh failure/);
 report.failurePropagates=true;report.passed=true;fs.writeFileSync(path.join(root,'dist/performance-block04.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});
