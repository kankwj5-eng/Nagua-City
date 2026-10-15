// Desktop software-renderer diagnostic. This is deliberately not an Android FPS benchmark.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),script=require('../tests/html-script.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
 const source=path.resolve(process.argv[2]||path.join(root,'dist/Managua.html'));
 const prefix=path.resolve(process.argv[3]||path.join(root,'dist/deep-profile'));
 const output=prefix+'.html',data=fs.readFileSync(source),open=Buffer.from('<script id="appSource" type="text/plain">'),a=data.indexOf(open)+open.length,b=data.indexOf('</script>',a);
 assert(a>=open.length&&b>a,'appSource missing');
 let app=data.subarray(a,b).toString();const marker='engine.runRenderLoop(()=>{';assert.equal(app.split(marker).length,2);
 app=app.replace(marker,fs.readFileSync(path.join(__dirname,'profiling/frame-hook.js'),'utf8')+'\n'+marker);
 const fd=fs.openSync(output,'w');for(const part of [data.subarray(0,a),Buffer.from(app),data.subarray(b)])fs.writeSync(fd,part);fs.closeSync(fd);
 const browser=await chromium.launch({executablePath:process.env.NAGUA_CHROMIUM||undefined,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--expose-gc','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:480,height:270}}),errors=[];
  page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE_ERROR '+e.message);});
  const cdp=await page.context().newCDPSession(page);
  await page.goto('file://'+output,{timeout:240000,waitUntil:'load'});
  await page.waitForFunction(()=>window.Nicaragua?.ready||window.Nicaragua?.boot45.failed,null,{timeout:240000,polling:1000});
  console.log('Game loaded');assert(await page.evaluate(()=>Nicaragua.ready),JSON.stringify(await page.evaluate(()=>Nicaragua.boot45)));
  await page.evaluate(()=>Nicaragua.engine.stopRenderLoop());
  await page.locator('#start').click({force:true});await page.evaluate(()=>Nicaragua.engine.stopRenderLoop());
  await page.evaluate(async()=>{for(let i=0;i<4;i++)await Nicaragua.stream(true);});
  // Warm shaders and data separately; fixed simulation delta makes each run reproducible.
  await page.evaluate(async()=>{for(let i=0;i<12;i++){__bench09.setDt();Nicaragua.engine.beginFrame();__frame09();Nicaragua.engine.endFrame();await new Promise(r=>setTimeout(r,0));}});
  await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});await cdp.send('Profiler.start');
  await page.evaluate(async()=>{window.__cost={};window.__frameTimes=[];for(let i=0;i<60;i++){__bench09.setDt();const t=performance.now();Nicaragua.engine.beginFrame();__frame09();Nicaragua.engine.endFrame();__frameTimes.push(performance.now()-t);await new Promise(r=>setTimeout(r,0));}});
  const {profile}=await cdp.send('Profiler.stop');fs.writeFileSync(prefix+'.cpuprofile',JSON.stringify(profile));
  const result=await page.evaluate(()=>({environment:{userAgent:navigator.userAgent,renderer:'SwiftShader software; desktop; 480x270; manual 1/60 simulation steps; instrumentation overhead included',physicalAndroid:false},cost:__cost,frames:__frameTimes,stats:Nicaragua.stats,metrics:Nicaragua.stage39.metrics,playing:Nicaragua.playing,boot:Nicaragua.boot45,meshes:Nicaragua.scene.meshes.length,materials:Nicaragua.scene.materials.length,callbacks:Nicaragua.scene.onBeforeRenderObservable.observers.length,technical:Nicaragua.technical44}));
  if(await page.evaluate(()=>!!Nicaragua.diagnostics09)){
   result.diagnosticProbe=await page.evaluate(()=>{const api=Nicaragua.diagnostics09;api.start(15);__bench09.setDt();Nicaragua.engine.beginFrame();__frame09();Nicaragua.engine.endFrame();const report=api.stop('browser-smoke');return {stages:Object.keys(report.stages),engineStages:Object.keys(report.engineStages),restored:!Nicaragua.stage39.sceneInstrument.captureActiveMeshesEvaluationTime};});
   assert(result.diagnosticProbe.stages.includes('sceneRenderCPU'));assert(result.diagnosticProbe.restored);
  }
  result.errors=errors;assert.equal(result.playing,true);assert.deepEqual(errors,[]);
  const counts=new Map(),nodes=new Map(profile.nodes.map(n=>[n.id,n]));
  for(let i=0;i<profile.samples.length;i++){const n=nodes.get(profile.samples[i]),name=n.callFrame.functionName||'(anonymous)',c=counts.get(name)||{name,selfMs:0,samples:0};c.selfMs+=(profile.timeDeltas[i]||0)/1000;c.samples++;counts.set(name,c);}
  result.cpuTop=[...counts.values()].sort((a,b)=>b.selfMs-a.selfMs).slice(0,25);
  fs.writeFileSync(prefix+'.json',JSON.stringify(result,null,2));
  await page.screenshot({path:prefix+'.png'});
  console.log('PROFILE_RESULT '+JSON.stringify(result));
 }finally{await browser.close();fs.unlinkSync(output);}
})().catch(e=>{console.error(e);process.exitCode=1});
