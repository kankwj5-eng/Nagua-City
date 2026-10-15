const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict'),readScript=require('./html-script.cjs');
const root=path.resolve(__dirname,'..'),source=process.argv[2]||path.join(root,'Managua_Del_taller_al_lago(1).html'),output=process.argv[3]||path.join(root,'dist/Managua.html');
const loadPack=code=>new Function(code+';return packKeys45;')();
(async()=>{
 const app=await readScript(output,'appSource'),start=app.indexOf('function packKeys45('),end=app.indexOf('function samplePacked45(',start);
 const before=loadPack(fs.readFileSync(path.join(root,'performance/animation-buffer-packing.js'),'utf8')),after=loadPack(app.slice(start,end));
 const report={block:3,scope:'unique retained animation-buffer payloads after preparation; not whole-process RAM',physicalAndroid:false,libraries:[]};
 for(const id of ['asset-animation38','asset-actor-motion']){
  const models=JSON.parse(zlib.gunzipSync(Buffer.from(await readScript(source,id),'base64'))),oldPool=new Map(),newPool=new Map(),oldArrays=new Set(),newArrays=new Set();let channels=0,float32=0,float64=0;
  for(const model of models)for(const clip of Object.values(model.clips))for(const track of Object.values(clip.tracks))for(const kind of ['rotation','translation']){
   const old=before(track[kind],kind,oldPool),next=after(track[kind],kind,newPool);oldArrays.add(old.packed45);newArrays.add(next.packed45);channels++;
   assert.equal(old.length,next.length);assert.equal(old.stride,next.stride);assert.equal(old.constant45,next.constant45);
   // Compare stored Number values directly with the previous block, including signed zero.
   assert.equal(old.packed45.length,next.packed45.length);for(let i=0;i<old.packed45.length;i++)assert(Object.is(old.packed45[i],next.packed45[i]));
   if(next.packed45 instanceof Float32Array)float32++;else{assert(next.packed45 instanceof Float64Array);float64++;}
  }
  const oldBytes=[...oldArrays].reduce((s,x)=>s+x.byteLength,0),newBytes=[...newArrays].reduce((s,x)=>s+x.byteLength,0);assert(newBytes<=oldBytes);
  if(id==='asset-animation38'){assert.equal(float32,channels);assert.equal(newBytes,oldBytes/2);}else{assert.equal(float64,channels);assert.equal(newBytes,oldBytes);}
  report.libraries.push({id,channels,float32Channels:float32,float64Channels:float64,beforeBlock03:oldBytes,afterBlock03:newBytes,saved:oldBytes-newBytes});
 }
 const cases=[
  {name:'exact fractions and signed zero',v:[[.5,-0,65536],[.25,-0,32768]],bits:32},
  {name:'non-representable decimals',v:[[.1,0,0],[.2,0,0]],bits:64},
  {name:'float32 integer boundary',v:[[16777216,0,0],[16777218,0,0]],bits:32},
  {name:'integer outside exact precision',v:[[16777217,0,0],[16777218,0,0]],bits:64},
  {name:'number below float32 subnormal range',v:[[Number.MIN_VALUE,0,0],[Number.MIN_VALUE,0,0]],bits:64},
  {name:'one high-precision key preserves entire track',v:[[1,0,0],[1+Number.EPSILON,0,0],[2,0,0]],bits:64},
  {name:'exact maximum float32',v:[[Math.fround(3.4e38),0,0],[0,0,0]],bits:32},
  {name:'non-finite data is kept in original storage',v:[[Infinity,0,0],[NaN,0,0]],bits:64},
 ];
 for(const c of cases){const keys=after(c.v,'translation');assert.equal(keys.packed45.BYTES_PER_ELEMENT*8,c.bits,c.name);for(let i=0;i<c.v.length;i++)for(let k=0;k<3;k++)assert(Object.is(keys.packed45[(keys.constant45?0:i*3)+k],c.v[i][k]),c.name);}
 const pool=new Map(),p=after([[0,0,0],[0,0,0]],'translation',pool),p2=after([[0,0,0]],'translation',pool),n=after([[-0,0,0],[-0,0,0]],'translation',pool);assert.equal(p.packed45,p2.packed45);assert.notEqual(p.packed45,n.packed45);assert(Object.is(n.packed45[0],-0));
 report.precisionCases=cases.map(({name,bits})=>({name,bits,passed:true}));report.beforeBlock03=report.libraries.reduce((s,x)=>s+x.beforeBlock03,0);report.afterBlock03=report.libraries.reduce((s,x)=>s+x.afterBlock03,0);report.savedThisBlock=report.beforeBlock03-report.afterBlock03;assert(report.savedThisBlock>0);report.passed=true;
 fs.writeFileSync(path.join(root,'dist/performance-block03.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});
