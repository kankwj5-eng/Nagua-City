const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),source=process.argv[2]||path.join(root,'Managua_Del_taller_al_lago(1).html'),output=process.argv[3]||path.join(root,'dist/Managua.html');
const script=require('./html-script.cjs');
(async()=>{
 const original=await script(source,'appSource'),modified=await script(output,'appSource');new vm.Script(original);new vm.Script(modified);
 const moduleB={exports:{}};new Function('module','exports',zlib.gunzipSync(Buffer.from(await script(source,'asset-babylon'),'base64')).toString())(moduleB,moduleB.exports);const B=moduleB.exports;
 const V=(x=0,y=0,z=0)=>new B.Vector3(x,y,z);
 const cleanClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function api(code){return new Function('B','V','clamp',code+'\nreturn {pack:packKeys45,sample:samplePacked45}')(B,V,cleanClamp);}
 const helperStart=original.indexOf('function packKeys45('),helperEnd=original.indexOf('const boot45=',helperStart);
 const old=api(original.slice(helperStart,helperEnd)),next=api(fs.readFileSync(path.join(root,'performance/animation-buffer-packing.js'),'utf8'));
 const report={block:1,engine:B.Engine.Version,libraries:[],maxSampleError:0,valuesCompared:0,samplesCompared:0,physicalAndroid:false};
 for(const id of ['asset-animation38','asset-actor-motion']){
  const models=JSON.parse(zlib.gunzipSync(Buffer.from(await script(source,id),'base64'))),pool=new Map(),distinct=new Set();let before=0,channels=0,constants=0;
  for(const model of models)for(const c of Object.values(model.clips))for(const track of Object.values(c.tracks))for(const kind of ['rotation','translation']){
   const values=track[kind],a=old.pack(values,kind),b=next.pack(values,kind,pool);before+=a.packed45.byteLength;distinct.add(b.packed45);channels++;constants+=+b.constant45;assert.equal(a.length,b.length);assert.equal(a.stride,b.stride);
   for(let i=0;i<values.length;i++)for(let axis=0;axis<a.stride;axis++){assert(Object.is(a.packed45[i*a.stride+axis],b.packed45[(b.constant45?0:i*a.stride)+axis]));report.valuesCompared++;}
   const property=kind==='rotation'?'rotationQuaternion':'position';
   for(const phase of [0,.001,.13,.3333333333,.49,.95,1])for(const blend of [.35,1]){
    const initial=kind==='rotation'?B.Quaternion.RotationYawPitchRoll(.1,.2,-.3):V(.2,-.1,.3),ta={target:{[property]:initial.clone()},property,keys:a},tb={target:{[property]:initial.clone()},property,keys:b};
    old.sample(ta,c.frames*phase,blend);next.sample(tb,c.frames*phase,blend);
    for(const axis of kind==='rotation'?['x','y','z','w']:['x','y','z']){const error=Math.abs(ta.target[property][axis]-tb.target[property][axis]);assert.equal(error,0);report.maxSampleError=Math.max(report.maxSampleError,error);}report.samplesCompared++;
   }
  }
  const after=[...distinct].reduce((s,a)=>s+a.byteLength,0);assert(after<before);report.libraries.push({id,channels,constants,before,after,saved:before-after});
 }
 // Constant representation must not erase signed zero or merge close float values.
 const pool=new Map(),positive=next.pack([[0,0,0],[0,0,0]],'translation',pool),negative=next.pack([[-0,0,0],[-0,0,0]],'translation',pool),close=next.pack([[Number.MIN_VALUE,0,0],[Number.MIN_VALUE,0,0]],'translation',pool);assert.notEqual(positive.packed45,negative.packed45);assert.notEqual(positive.packed45,close.packed45);assert(Object.is(negative.packed45[0],-0));assert.equal(next.pack([[0,0,0],[-0,0,0]],'translation').constant45,false);
 report.totalBefore=report.libraries.reduce((s,x)=>s+x.before,0);report.totalAfter=report.libraries.reduce((s,x)=>s+x.after,0);report.saved=report.totalBefore-report.totalAfter;report.passed=true;
 fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist/performance-block01.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});
