const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),zlib=require('node:zlib'),assert=require('node:assert/strict'),readScript=require('./html-script.cjs');
const root=path.resolve(__dirname,'..'),fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'streaming-zones.fixture.json'))),report={block:2,source:'real zone metadata / deterministic planner and cache simulation',physicalAndroid:false,scenarios:[]};
function make(app){
 let code=app.slice(app.indexOf('// Technical-only changes:'),app.indexOf('function houseBytes44(',app.indexOf('// Technical-only changes:')));
 const optimized=code.includes('near.push({z,d});');code=optimized?code.replace('near.push({z,d});','near.push((planObjects++,{z,d}));'):code.replace('.map(z=>({z,d:Math.hypot(','.map(z=>(planObjects++,{z,d:Math.hypot(');
 const counts={hypot:0,inflate:0},math=Object.create(Math);math.hypot=(...a)=>{counts.hypot++;return Math.hypot(...a);};
 const catalog={zones:fixture.world.map(z=>({...z,data:zlib.gzipSync(JSON.stringify(z)).toString('base64')}))},extensions={zones:fixture.extensions.map(z=>({...z,data:zlib.gzipSync(JSON.stringify(z)).toString('base64')}))};
 const ctx=vm.createContext({catalog,extensions,Math:math,counts,Buffer,console:{error(){}},setImmediate});
 const init=`let quality='high',homeMode=false,homeGarage=false,driving=false,streamDefinitions25=null,streamBusy=false,planObjects=0,failNext=false;
 const V=(x,y,z)=>({x,y,z}),spawn=V(-37,0,111),player={root:{position:V(-37,0,111)}},current={root:{position:V(-37,0,111)}},zones=new Map(),pending=new Set(),shapeGeometries25=new Map(),simulation25={load:{zones:0,maxZoneBatch:0}};const trace=[];
 function bytes(s){return Buffer.from(s,'base64');}
 async function inflate(b){counts.inflate++;await new Promise(r=>setImmediate(r));if(failNext){failNext=false;throw Error('fixture inflate failed');}const x=Buffer.from(requireInflate(b));return x.buffer.slice(x.byteOffset,x.byteOffset+x.length);}
 async function unpack(z,extra){if(zones.has(z.id)||pending.has(z.id))return;pending.add(z.id);try{await zoneBuffer44(z,extra);trace.push('load:'+z.id);zones.set(z.id,{definition:z,root:{dispose(){trace.push('dispose:'+z.id);}}});}finally{pending.delete(z.id);}}
 async function loadYield25(){await new Promise(r=>setImmediate(r));}function updateShadowList(){trace.push('shadow');}function toast(){}
 `;
 ctx.requireInflate=b=>zlib.gunzipSync(b);
 vm.runInContext(init+code+`globalThis.api={stream:refreshZones44,buffer:zoneBuffer44,stats:technical44,trace,set(q,x,z,home=false,garage=false,drive=false){quality=q;homeMode=home;homeGarage=garage;driving=drive;Object.assign(player.root.position,{x,z});Object.assign(current.root.position,{x,z});},fail(){failNext=true;},snap(){return {zones:[...zones.keys()],pending:pending.size,reads:zoneReads44.size,workers:streamWorkers44,cacheBytes:technical44.zoneCacheBytes,cacheEntries:zoneCache44.size,planObjects,stats:{...technical44},counts:{...counts}};}};`,ctx);
 return ctx.api;
}
async function replay(api,quality){
 api.set(quality,-37,111);await Promise.all(Array.from({length:60},()=>api.stream(true)));for(let i=0;i<6;i++)await api.stream(true);
 const warm=api.snap();await Promise.all(Array.from({length:60},()=>api.stream(false)));assert.equal(api.snap().counts.inflate,warm.counts.inflate);
 const route=[[-37,111],[-111,37],[-220,-265],[-185,185],[185,-185],[-37,111]];
 for(let lap=0;lap<3;lap++)for(const [x,z]of route){api.set(quality,x,z);for(let i=0;i<5;i++)await api.stream(true);}
 // A new position arriving while a pass is pending must be serviced by the same worker.
 api.set(quality,-185,-185);const first=api.stream(true);api.set(quality,37,37);const second=api.stream(true);await Promise.all([first,second]);for(let i=0;i<6;i++)await api.stream(true);
 // Exercise the menu/garage/driving position branches as well.
 for(const [home,garage,drive]of [[true,false,false],[true,true,false],[false,false,true]]){api.set(quality,-37,111,home,garage,drive);for(let i=0;i<6;i++)await api.stream(true);}
 const state=api.snap();assert.equal(state.pending,0);assert.equal(state.reads,0);assert.equal(state.workers,0);assert.equal(state.stats.maxStreamWorkers,1);assert.equal(state.stats.errors.length,0);assert(state.cacheBytes<=state.stats.zoneCacheLimit);return state;
}
(async()=>{
 const source=process.argv[2]||path.join(root,'Managua_Del_taller_al_lago(1).html'),output=process.argv[3]||path.join(root,'dist/Managua.html'),a=await readScript(source,'appSource'),b=await readScript(output,'appSource');new vm.Script(b);
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'dist/build-verification.json'))).baseSha256,fixture.baseSha256);
 for(const quality of ['low','medium','high']){
  const old=make(a),next=make(b),x=await replay(old,quality),y=await replay(next,quality);assert.deepEqual(Array.from(next.trace),Array.from(old.trace));assert.deepEqual(Array.from(y.zones),Array.from(x.zones));assert.equal(JSON.stringify(y.stats),JSON.stringify(x.stats));assert.equal(y.counts.inflate,x.counts.inflate);assert(y.counts.hypot<x.counts.hypot);assert(y.planObjects<x.planObjects);
  report.scenarios.push({quality,passes:y.stats.streamPasses,requests:y.stats.streamRequests,reads:y.counts.inflate,cacheHits:y.stats.zoneCacheHits,workers:y.stats.maxStreamWorkers,hypotBefore:x.counts.hypot,hypotAfter:y.counts.hypot,planObjectsBefore:x.planObjects,planObjectsAfter:y.planObjects,traceIdentical:true});
 }
 const cacheCases=[];
 for(const code of [a,b]){
  const api=make(code),z={...fixture.world.find(z=>!z.permanent),data:zlib.gzipSync('exact buffer fixture').toString('base64')};
  const buffers=await Promise.all(Array.from({length:60},()=>api.buffer(z,false)));assert(buffers.every(x=>x===buffers[0]));assert.equal(api.snap().counts.inflate,1);
  await api.buffer(z,false);assert.equal(api.snap().counts.inflate,1);await api.buffer(z,true);assert.equal(api.snap().counts.inflate,2);
  api.stats.zoneCacheLimit=48;for(let i=0;i<12;i++)await api.buffer({...z,id:'lru-'+i},false);assert(api.snap().cacheBytes<=48);
  api.fail();await assert.rejects(api.buffer({...z,id:'failure'},false));assert.equal(api.snap().reads,0);await api.buffer({...z,id:'failure'},false);assert.equal(api.snap().reads,0);
  cacheCases.push({coalescedRequests:60,firstInflations:1,namespaceIsolation:true,boundedEviction:true,retryAfterFailure:true});
 }
 assert.deepEqual(cacheCases[0],cacheCases[1]);report.cache=cacheCases[1];report.passed=true;fs.writeFileSync(path.join(root,'dist/performance-block02.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});
